"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

//Make delete Button HTML for story

function getDeleteBtnHTML(){
  return `<span class="trash-can">
  <i class = "fas fa-trash-alt"></i>
  </span>`
}

//favourite/not-favorite star for story
function getStarHTML(story, user){
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
  <span class="star">
  <i class="${starType} fa-star"><?i>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//handle deleting a story

async function deleteStory(evt){
  console.debug ("deleteStory");
 // Description: For each element in the set, get the first element that matches the selector by testing the element itself and 
  //traversing up through its ancestors in the DOM tree.
  const $closestLi =$(evt.target).$closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  //re-generate story list
  await putUserStoriesOnPage();
}
$ownStories.on("click",".trash-can, deleteStory");

//Handle submission of new Story
async function submitNewStory(evt) {
console.debug ("submitNewStory");
evt.preventDefault();

//on submit
//get data from form
const author = $("#create-author").val();
const title = $('#create-title').val();
const url = $("#create-url").val();
const username = currentUser.username;
const storyData = {title, url, author, username}
//addStory()
const story = await storyList.addStory(currentUser,StoryData);
const $story = generateStoryMarkup(story);
$allStoriesList.prepend($story);

//hide form and reset it
//form with slide up slowly
$submitForm.slideUp("slow");
//The trigger() method triggers the specified event and the default behavior of an event 
//(like form submission) for the selected elements.
$submitForm.trigger("reset");
}

$submitForm.on("submit",submitNewStory);

/******************************************************************************
 * Functionality for favorites list and starr/un-starr a story
 */

/** Put favorites list on page. */

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}

/** Handle favorite/un-favorite a story */

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);


