import { html, mount, map, when } from "./quack";

let count = 100;
let name = "John";

const Greet = () => html`
  <div>
    <input value=${() => name} oninput=${(e: any) => (name = e.target.value)} />
    <p>Hello ${() => name}!</p>
  </div>
`;

mount(
  html`
    <div>
      ${Greet()} ${Greet()} ${Greet()}
      ${when(
        () => count % 2 === 0,
        html` <div>odd</div> `,
        html` <div>even</div> `
      )}
      <button onclick=${(e: any) => count++}>+</button>
      <button onclick=${(e: any) => count--}>-</button>
      <p>Count: ${() => count}</p>
    </div>
    <table border="1">
      <tbody>
        <template>
          ${map(
            () => [...Array(count).keys()],
            (n) => html`
              <tr>
                <template>
                  ${map(
                    () => [...Array(8).keys()],
                    (m) => html` <td>Item ${() => n} ${() => m}</td> `
                  )}
                </template>
              </tr>
            `
          )}
        </template>
      </tbody>
    </table>
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
