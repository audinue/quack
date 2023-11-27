class Binding {
  constructor(public node: Node, public render: () => void) {}
}

let PLACEHOLDER = "{0}";

let Frag = () => document.createDocumentFragment();

let Placeholder = () => document.createTextNode("");

let TextBinding = (evaluator: () => any) => {
  let node = Placeholder();
  let prev: any;
  return new Binding(node, () => {
    let curr = evaluator();
    if (curr !== prev) {
      prev = curr;
      node.nodeValue = curr;
    }
  });
};

let AttrBinding = (attr: Attr, tokens: string[], values: any[]) => {
  let head = tokens[0];
  let tail = tokens.slice(1);
  let normalize = (value: any) =>
    typeof value === "function" ? value : () => value;
  let evaluators = tail.map(() => normalize(values.shift()));
  let prev: any;
  return new Binding(attr, () => {
    let curr = tail.reduce(
      (string, token, index) => string + evaluators[index]() + token,
      head
    );
    if (curr !== prev) {
      prev = curr;
      let owner: any = attr.ownerElement;
      if (attr.name === "value") {
        owner.value = curr;
      } else if (attr.name === "disabled") {
        owner.disabled = curr === "true";
      } else if (attr.name === "checked") {
        owner.checked = curr === "true";
      } else if (attr.name === "selected") {
        owner.selected = curr === "true";
      } else {
        attr.value = curr;
      }
    }
  });
};

let TagBinding = (strings: TemplateStringsArray, ...values: any[]) => {
  let template = document.createElement("template");
  template.innerHTML = strings.join(PLACEHOLDER);
  let node = template.content.children[0];
  let children: Binding[] = [];
  let init = (node: Node) => {
    if (node instanceof Text) {
      let tokens = node.nodeValue!.split(PLACEHOLDER);
      if (tokens.length > 1) {
        let frag = Frag();
        frag.append(tokens[0]);
        tokens.slice(1).forEach((token) => {
          let value = values.shift();
          if (value instanceof Binding) {
            children.push(value);
            frag.append(value.node);
          } else if (typeof value === "function") {
            let child = TextBinding(value);
            children.push(child);
            frag.append(child.node);
          } else {
            frag.append(value);
          }
          frag.append(token);
        });
        node.replaceWith(frag);
      }
    } else if (node instanceof Element) {
      [...node.attributes].forEach((attr) => {
        let tokens = attr.value.split(PLACEHOLDER);
        if (tokens.length > 1) {
          if (attr.name.startsWith("on")) {
            let value = values.shift();
            node.addEventListener(attr.name.slice(2), (e) => {
              value.call(node, e);
              render();
            });
          } else {
            children.push(AttrBinding(attr, tokens, values));
          }
        }
      });
      [...node.childNodes].forEach(init);
    }
  };
  init(node);
  return new Binding(node, () => children.forEach((child) => child.render()));
};

let bindings: Binding[] = [];
let request: number;

let mount = (binding: Binding, container: Element | string) => {
  bindings.push(binding);
  let init = () => {
    let el =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    if (el) {
      binding.render();
      el.append(binding.node);
    }
  };
  if (document.readyState !== "interactive") {
    addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
};

let render = () => {
  cancelAnimationFrame(request);
  request = requestAnimationFrame(() =>
    bindings.forEach((binding) => binding.render())
  );
};

let MapBinding = <T>(array: () => T[], render: (el: T) => Binding) => {
  let prev: any[] = [];
  let children: Binding[] = [];
  let node = Placeholder();
  return new Binding(node, () => {
    let prevLen = prev.length;
    let curr = array();
    let currLen = curr.length;
    if (prevLen < currLen) {
      let frag = Frag();
      for (let i = prevLen; i < currLen; i++) {
        let child = render(curr[i]);
        children.push(child);
        frag.append(child.node);
      }
      node.before(frag);
    } else if (currLen < prevLen) {
      for (let i = currLen; i < prevLen; i++) {
        (children[i].node as any).remove();
      }
      children.splice(currLen);
    }
    children.forEach((child) => child.render());
    prev = curr;
  });
};

let WhenBinding = (
  condition: () => boolean,
  ifTrue: Binding,
  ifFalse: Binding
) => {
  let prev: boolean;
  let node: any = Placeholder();
  return new Binding(node, () => {
    let curr = condition();
    if (curr !== prev) {
      prev = curr;
      if (curr) {
        node.replaceWith((node = ifTrue.node));
      } else {
        node.replaceWith((node = ifFalse.node));
      }
    }
  });
};

export {
  TagBinding as html,
  mount,
  render,
  MapBinding as map,
  WhenBinding as when,
};
