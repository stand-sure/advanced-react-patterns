// Control Props
// http://localhost:3000/isolated/exercise/06.js

import * as React from "react";
import {Switch} from "../switch";
import warning from "warning";

const warningShouldBeFalse = (shouldBeFalse, text) =>
  warning(!shouldBeFalse, text);

function nameOf(obj) {
  return Object.keys(obj)[0];
}

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach(fn => fn?.(...args));

const actionTypes = {
  toggle: "toggle",
  reset: "reset",
};

function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case actionTypes.toggle: {
      return {on: !state.on};
    }
    case actionTypes.reset: {
      return initialState;
    }
    default: {
      throw new Error(`Unsupported type: ${type}`);
    }
  }
}

function useControlledSwitchWarning({
  controlledPropValue,
  controlledPropName,
  componentName,
}) {
  const isControlled = controlledPropValue !== undefined;
  const {current: wasControlled} = React.useRef(isControlled);

  React.useEffect(() => {
    const isNowControlled = !wasControlled && isControlled;
    const noLongerControlled = wasControlled && !isControlled;

    warningShouldBeFalse(
      noLongerControlled,
      `\`${componentName}\` is changing from controlled to be uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlledPropName}\` prop.`,
    );

    warningShouldBeFalse(
      isNowControlled,
      `\`${componentName}\` is changing from uncontrolled to be controlled. Components should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlledPropName}\` prop.`,
    );
  }, [componentName, controlledPropName, isControlled, wasControlled]);
}

function useOnChangeReadonlyWarning({
  controlledPropValue,
  controlledPropName,
  componentName,
  hasOnChange,
  readOnly,
  readOnlyPropName,
  initialValuePropName,
  onChangePropName,
}) {
  const isControlled = controlledPropValue !== undefined;
  React.useEffect(() => {
    const missingChangeHandler = isControlled && !hasOnChange && !readOnly;

    warningShouldBeFalse(
      missingChangeHandler,
      `A \`${controlledPropName}\` prop was provided to \`${componentName}\` without an \`${onChangePropName}\` handler. This will result in a read-only \`${controlledPropName}\` value. If you want it to be mutable, use \`${onChangePropName}\`. Otherwise, set either \`${initialValuePropName}\` or \`${readOnlyPropName}\`.`,
    );
  }, [
    componentName,
    controlledPropName,
    hasOnChange,
    initialValuePropName,
    isControlled,
    onChangePropName,
    readOnly,
    readOnlyPropName,
  ]);
}

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  onChange,
  on: controlledOn,
  readOnly = false,
} = {}) {
  const {current: initialState} = React.useRef({on: initialOn});
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const isControlled = typeof controlledOn === "boolean";
  const on = isControlled ? controlledOn : state.on;

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useControlledSwitchWarning({
      controlledPropName: nameOf({on}),
      controlledPropValue: controlledOn,
      componentName: nameOf({useToggle}),
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useOnChangeReadonlyWarning({
      controlledPropValue: controlledOn,
      controlledPropName: nameOf({on}),
      componentName: nameOf({useToggle}),
      hasOnChange: typeof onChange === "function",
      readOnly,
      readOnlyPropName: nameOf({readOnly}),
      initialValuePropName: nameOf({initialOn}),
      onChangePropName: nameOf({onChange}),
    });
  }

  function dispatchWithOnChange(action) {
    !isControlled && dispatch(action);
    const suggestedState = reducer({...state, on}, action);
    onChange?.(suggestedState, action);
  }

  const toggle = () => dispatchWithOnChange({type: actionTypes.toggle});
  const reset = () =>
    dispatchWithOnChange({type: actionTypes.reset, initialState});

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

function Toggle({
  on: controlledOn,
  onChange,
  readOnly,
  initialOn = false,
} = {}) {
  const {on, getTogglerProps} = useToggle({
    on: controlledOn,
    onChange,
    readOnly,
    initialOn,
  });
  const props = getTogglerProps({on});
  return <Switch {...props} />;
}

function App() {
  const [bothOn, setBothOn] = React.useState(false);
  const [timesClicked, setTimesClicked] = React.useState(0);

  function handleToggleChange(state, action) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return;
    }
    setBothOn(state.on);
    setTimesClicked(c => c + 1);
  }

  function handleResetClick() {
    setBothOn(false);
    setTimesClicked(0);
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle initialOn={true} readOnly={true} />
        <Toggle on={false} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          initialOn={true}
          onChange={(...args) =>
            console.info("Uncontrolled Toggle onChange", ...args)
          }
        />
      </div>
    </div>
  );
}

export default App;
// we're adding the Toggle export for tests
export {Toggle};

/*
eslint
  no-unused-vars: "off",
*/
