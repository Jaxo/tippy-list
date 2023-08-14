(function() {
   "use strict";
   customElements.define(
      "tippy-list",
      class extends HTMLUListElement {
         static #slot;
         static {
            this.#slot = document.createElement("DIV");
            this.#slot.id = "tippy-lists";
            document.documentElement.querySelector("head").insertAdjacentHTML(
               "beforeend",
               "<style>" +
               "#tippy-lists ul" +
                  "{width:80px;padding-left:0;margin:0;}" +
               "#tippy-lists ul>li" +
                  "{display:inline-block;position:relative;width:100%;}" +
               "#tippy-lists ul > li.list" +
                  "{display:flex;justify-content:space-between;}" +
               "#tippy-lists ul > li.list:after" +
                  "{content: \"\\25B8\";}" +
               "</style>"
            );
            document.documentElement.querySelector("body").appendChild(
               this.#slot
            );
            this.#slot.addEventListener(
               "click", (evt) => {
                   this.#slot.dispatchEvent(
                      new CustomEvent("change", { detail: {evt: evt} })
                   );
               }
            );
         }
         #isInited = false;
         #listener = (evt) => { console.log(evt) };
         connectedCallback() {
            if (!this.#isInited) {
               this.#isInited = true;
               this.constructor.#slot.addEventListener(
                  "change", (evt)=>this.#listener(evt.detail.evt)
               );
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
               if (ref) ref.classList.add("list");
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
