(function() {
   "use strict";
   customElements.define(
      "tippy-list",
      class extends HTMLUListElement {
         static #slot;
         static #scope = null;
         static #actionsList;
         static {
            this.#slot = document.createElement("DIV");
            this.#slot.id = "tippy-lists";
            this.#actionsList = {
               onitemclicked: null,
               onlistclicked: null
            };
            document.documentElement.querySelector("head").insertAdjacentHTML(
               "beforeend",
               "<style>@layer tippy-lists-default {" +
               "#tippy-lists ul" +
                  "{width:80px;padding-left:0;margin:0;}" +
               "#tippy-lists ul>li" +
                  "{display:inline-block;position:relative;width:100%;}" +
               "#tippy-lists ul > li:hover" +
                  "{font-weight:bold;cursor:pointer}" +
               "#tippy-lists ul > li.list" +
                  "{display:flex;justify-content:space-between;}" +
               "#tippy-lists ul > li.list:hover" +
                  "{font-weight:normal;cursor:default;}" +
               "#tippy-lists ul > li.list:after" +
                  "{content: \"\\25B8\";}" +
               "}</style>"
            );
            document.documentElement.querySelector("body").appendChild(
               this.#slot
            );
            this.#slot.addEventListener(
               "click",
               (evt) => {
                  let fct;
                  evt.stopPropagation();
                  if (evt.target.classList.contains('list')) {
                     fct = this.#actionsList["onlistclicked"];
                  }else {
                     fct = this.#actionsList["onitemclicked"];
                  }
                  fct && (this.#scope || window)[fct](evt);
               },
               true  // capturing phase
            );
         }
         static set #actions(attributes) {
            for (const k in this.#actionsList) {
               this.#actionsList[k] = attributes.getNamedItem(k)?.value || null;
            }
         }
         static hideAll() {
            this.#slot.querySelectorAll(":scope > div").forEach(
               (div) => {
                  div._tippy.setProps({onHide:()=>true});
                  div._tippy.hide();
               }
            );
         }
         static set scope(obj) {  // scoped callbacks (onXxxxClicked)
            this.#scope = obj;
         }

         #isInited = false;
         connectedCallback() {
            if (!this.#isInited) {
               this.#isInited = true;
               this.constructor.#actions = this.attributes;
               this.#tippyfy(
                  document.documentElement.querySelector(
                     this.getAttribute("select")
                  ), {
                     placement: "bottom",
                     content: (reference)=>this,
                     onCreate: (instance)=>this.#tippyfy(
                        instance, {onCreate: (instance)=>this.#tippyfy(instance)}
                     )
                  }
               );
            }
         }
         #tippyfy(instance, optionalProps = {}) {
            const slot = this.constructor.#slot;
            let ref = instance.popper?.querySelector("ul>li>ul").parentNode;
            do {
               ref && ref.classList.add("list");
               tippy(
                  ref || instance, {
                     ...{
                        allowHTML: true,
                        interactive: true,
                        duration: [null, 0],
                        appendTo: () => slot,
                        content: () => ref.querySelector(":scope > ul"),
                        placement: "right",
                        trigger: "mouseenter",
                        offset: [0, 15],
                        onShown: (instance) => {
                           slot.querySelectorAll(":scope > div").forEach(
                              (node, i, nodes) => {
                                 node._tippy.setProps({
                                    onHide: () => node==instance.popper,
                                    onHidden: () => {
                                       (i) && nodes[i-1]._tippy.setProps(
                                          {onHide:()=>true}
                                       );
                                    }
                                 });
                              }
                           );
                        },
                        onUntrigger: (instance, evt) => {
                           if (evt.type == "mouseleave") instance.hide();
                        }
                     }, ...optionalProps
                  }
               );
               while (ref && (ref=ref.nextElementSibling) && !ref.firstElementChild);
            }while (ref);
         }
      },
      { extends: "ul" }
   );
})();
