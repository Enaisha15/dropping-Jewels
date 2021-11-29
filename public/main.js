var likeButton = document.getElementsByClassName("like");
var Delete = document.getElementsByClassName("Delete");
var searchi = document.getElementById("searchinput")
var searchb = document.getElementById('searchbutton')


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

// //  searchb.addEventListener('click', function(e){
//       window.location.href = "/search/"+searchi.value
//     })
  

Array.from(Delete).forEach(function(element) {
  element.addEventListener('click', function(e){
    console.log(e.target)
    const postId = e.target.dataset.value;
    console.log(postId)
    fetch('messages', {
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