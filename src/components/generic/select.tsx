import { Children, isValidElement, useState, type ReactNode } from "react";
import Dropdown from "./dropdown";
import "./select.css";
import { dialogifyKey } from "../../utils/utils";

type OptionProp = {
  value?: string | number | readonly string[];
  children?: ReactNode;
};

type ValueType = string | number | readonly string[] | undefined;

const Select = ({
  defaultValue,
  onChange,
  children,
}: {
  defaultValue?: ValueType;
  onChange: (value: ValueType) => void;
  children: ReactNode;
}) => {
  const [current, setCurrentState] = useState({
    value: defaultValue,
    index: getIndexOf(defaultValue, children),
  });

  function setValue(newValue: ValueType, index: number) {
    if (newValue === current.value) {
      return;
    }

    onChange(newValue);
    setCurrentState({ value: newValue, index: index });
  }

  return (
    <Dropdown dropdownButton={dialogifyKey(current.value)}>
      <div className="select">
        {Children.map(children, (child, index) => {
          if (!isValidElement(child)) {
            return null;
          }

          const option = child.props as OptionProp;

          const isSelected = index === current.index;

          return (
            <div
              className={`${isSelected ? "selected" : ""}`}
              key={child.key}
              onClick={() => setValue(option.value, index)}
            >
              {dialogifyKey(option.value)}
            </div>
          );
        })}
      </div>
    </Dropdown>
  );
};

function getIndexOf(value: ValueType, children: ReactNode) {
  let retIndex: number | undefined;
  Children.forEach(children, (child, index) => {
    if (!isValidElement(child)) {
      return;
    }

    const option = child.props as OptionProp;

    if (option.value === value) {
      retIndex = index;
      return;
    }
  });

  return retIndex;
}

export default Select;
