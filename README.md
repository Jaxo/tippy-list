# tippy-list
Nested lists of [TippyJS](https://atomiks.github.io/tippyjs/)' tippies.

[Running Example](https://jaxo.github.io/tippy-list/tippyList.html)
## Customization
### style 
To apply your own list style overriding the defaults, take a look at the
style injected in [tippy-list.js](https://jaxo.github.io/tippy-list/tippy-list.js) file. 
You can override the *tippy-lists-default CSS* layer with your own style (CSS) file.

For example, `#tippy-lists ul > li.list:after { content: "\00BB"; }`
### scope
"onitemclicked" and "onlistclicked" are the names of callback methods,
as you can see in the [running example](https://jaxo.github.io/tippy-list/tippyList.html):
```
<script>
function clicked(evt) {
   res.value += "\n\u25e6 clicked on " + evt.target.id;
   res.scrollTop = res.scrollHeight; // aka autoscroll
}
</script>
[...]
<ul is="tippy-list" select="#test" onItemClicked="clicked">
```
To not pollute the global scope, a `scope` setter method is provided.
Replacing the script above by:

```
<script>
(async function() {
   await customElements.whenDefined("tippy-list");
   customElements.get("tippy-list").scope = {
      clicked: (evt) => {
         res.value += "\n\u25e6 clicked on " + evt.target.id;
         res.scrollTop = res.scrollHeight; // aka autoscroll
      }
   }
}());
</script>
```
scopes the *clicked* function, removing it from the global scope.
