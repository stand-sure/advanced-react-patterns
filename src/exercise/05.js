// State Reducer
// http://localhost:3000/isolated/exercise/05.js

import * as React from "react";
import {Switch} from "../switch";

const toggleReducerActionTypes = {
  TOGGLE: "toggle",
  RESET: "reset",
};

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach(fn => fn?.(...args));

function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case toggleReducerActionTypes.TOGGLE: {
      return {on: !state.on};
    }
    case toggleReducerActionTypes.RESET: {
      return initialState;
    }
    default: {
      throw new Error(`Unsupported type: ${type}`);
    }
  }
}

function useToggle({initialOn = false, reducer = toggleReducer} = {}) {
  const {current: initialState} = React.useRef({on: initialOn});
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const {on} = state;

  const toggle = () => dispatch({type: toggleReducerActionTypes.TOGGLE});
  const reset = () => dispatch({type: toggleReducerActionTypes.RESET, initialState});

  function getTogglerProps({onClick, ...props} = {}) {
    return {
      "aria-pressed": on,
      onClick: callAll(onClick, toggle),
      ...props,
    };
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    };
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  };
}

function App() {
  const [timesClicked, setTimesClicked] = React.useState(0);
  const clickedTooMuch = timesClicked >= 4;

  function toggleStateReducer(state, action) {
    if (action.type === toggleReducerActionTypes.TOGGLE && clickedTooMuch) {
      return {on: state.on};
    }

    return toggleReducer(state, action);
  }

  const {on, getTogglerProps, getResetterProps} = useToggle({
    reducer: toggleStateReducer,
  });

  function ClickCount() {
    return timesClicked > 0 ? (
      <div data-testid="click-count">Click count: {timesClicked}</div>
    ) : null;
  }

  function Notice() {
    return (
      <div data-testid="notice">
        Whoa, you clicked too much!
        <br />
      </div>
    );
  }

  function ClickCountOrNotice() {
    return clickedTooMuch ? <Notice /> : <ClickCount />;
  }

  return (
    <div>
      <Switch
        {...getTogglerProps({
          disabled: clickedTooMuch,
          on: on,
          onClick: () => setTimesClicked(count => count + 1),
        })}
      />
      {ClickCountOrNotice()}
      <button {...getResetterProps({onClick: () => setTimesClicked(0)})}>
        Reset
      </button>
    </div>
  );
}

export default App;

/*
eslint
  no-unused-vars: "off",
*/
