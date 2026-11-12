/* DARKTEC language chooser: optional Google Translate redirect, initiated only by the visitor. */
document.addEventListener("click",function(event){
 const link=event.target.closest("[data-darktec-language]");
 if(!link)return;
 event.preventDefault();
 const language=link.getAttribute("data-darktec-language");
 if(!language||language==="en")return;
 const target="https://translate.google.com/translate?sl=en&tl="+encodeURIComponent(language)+"&u="+encodeURIComponent(window.location.href);
 window.location.assign(target);
});