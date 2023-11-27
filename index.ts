import { html, mount, map, when } from "./quack";

let items: string[] = [];

mount(
  html`
    <button onclick=${() => items.push("0")}>Add Item</button>
    ${() => items.length}
    ${map(
      () => items,
      (item, index) => html`
        <input
          value=${() => item()}
          oninput=${(e: any) => (items[index()] = e.target.value)}
        />
        <button onclick=${() => items.splice(index(), 1)}></button>
      `
    )}
    <ul>
      ${map(
        () => items,
        (item) => html`<li>${() => item()}</li>`
      )}
    </ul>
  `,
  "body"
);

// let name = "John";

// mount(
//   html`
//     <input value=${() => name} oninput=${(e: any) => (name = e.target.value)} />
//     <input value=${() => name} oninput=${(e: any) => (name = e.target.value)} />
//     <input value=${() => name} oninput=${(e: any) => (name = e.target.value)} />
//     <p>Hello ${() => name}!</p>
//     ${when(
//       () => name.length % 2 == 0,
//       html`Length is even`,
//       html`Length is odd`
//     )}
//     <select>
//       <option selected=${() => name.length % 2 === 0}>Even</option>
//       <option selected=${() => name.length % 2 !== 0}>Odd</option>
//     </select>
//     ${map(
//       () => [...Array(name.length).keys()],
//       (el) => html`${() => name.substring(0, el + 1)}<br>`
//     )}
//   `,
//   "body"
// );
