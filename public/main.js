var likeButton = document.getElementsByClassName("like");
var Delete = document.getElementsByClassName("Delete");



Array.from(likeButton).forEach(function (element) {
  element.addEventListener("click", function () {
    const postId = element.dataset.value;
    console.log(postId);
    console.log("hi");
    fetch("likes", {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: postId,
      }),
    })
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((data) => {
        console.log(data);
        window.location.reload(true);
      });
  });
});

var commentButton = document.getElementsByClassName("sendComment");

Array.from(commentButton).forEach(function (element) {
  element.addEventListener("click", function () {
    const comment = document.querySelector(".userComment").value;
    const postId = element.dataset.value;

    console.log("postId = " + postId);
    console.log(comment);

    fetch("submit", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: comment,
        postId: postId,
      }),
    });
    window.location.reload(true);
  });
});

Array.from(Delete).forEach(function(element) {
  element.addEventListener('click', function(){
    const postId = element.dataset.value;
    fetch('posts', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'postId': postId,
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});
