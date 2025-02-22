// Compound Components
// http://localhost:3000/isolated/exercise/02.js

// 📜 https://reactjs.org/docs/react-api.html#reactchildren
// 📜 https://reactjs.org/docs/react-api.html#cloneelement

import * as React from "react";
import {Switch} from "../switch";

function passStateToChildren(children, props) {
  return React.Children.map(children, child => {
    return typeof child.type === "string"
      ? child
      : React.cloneElement(child, {...props});
  });
}

function Toggle({children}) {
  const [on, setOn] = React.useState(false);
  const toggle = () => setOn(!on);
  return passStateToChildren(children, {on, toggle});
}

const ToggleOn = ({on, children}) => (on ? children : null);
const ToggleOff = ({on, children}) => (on ? null : children);
const ToggleButton = ({on, toggle}) => <Switch on={on} onClick={toggle} />;

function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <ToggleButton />
        <span>Click to toggle</span>
      </Toggle>
    </div>
  );
}

export default App;

/*
eslint
  no-unused-vars: "off",
*/
