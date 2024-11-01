var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
      this.classList.remove("open");
      this.classList.add("closed");

      content.classList.remove("c-open");
      content.classList.add("c-closed");
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      this.classList.remove("closed");
      this.classList.add("open");

      content.classList.remove("c-closed");
      content.classList.add("c-open");
    } 
  });
}
