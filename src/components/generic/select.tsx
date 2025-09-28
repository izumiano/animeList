import { Children, isValidElement, useState, type ReactNode } from "react";
import Dropdown from "./dropdown";
import "./select.css";
import { type Alignment } from "../../utils/utils";
import dropdownIcon from "../../assets/dropdown.png";
import type { Property } from "csstype";

type OptionProp<T extends ValueType> = {
  value?: T;
  className?: string;
  children?: ReactNode;
};

type ValueType = string | number | readonly string[] | undefined;

function Select<T extends ValueType>({
  defaultValue,
  onChange,
  onOpenChange,
  autocloseOnChange,
  dropdownAlignment,
  className,
  listStyle,
  label,
  margin,
  children,
}: {
  defaultValue?: T;
  onChange: (value: T) => void;
  onOpenChange?: (isOpen: boolean) => void;
  autocloseOnChange?: boolean;
  dropdownAlignment?: Alignment;
  className?: string;
  listStyle?: "list" | "wrappedList";
  margin?: Property.Margin;
  label?: ReactNode;
  children: ReactNode;
}) {
  const [current, setCurrentState] = useState(
    getInitialCurrentState(defaultValue, children)
  );

  function setValue(newValue: T | undefined, index: number | undefined) {
    if (
      newValue === current.value ||
      newValue === undefined ||
      index === undefined
    ) {
      return;
    }

    onChange(newValue);
    setCurrentState({ value: newValue, index: index });
  }

  autocloseOnChange ??= false;
  dropdownAlignment ??= "left";
  listStyle ??= "list";
  margin ??= "var(--mediumMargin)";

  const childrenArr = Children.toArray(children);

  const dropdownTitleOption = childrenArr[current.index ?? 0];
  let dropdownTitle: ReactNode;
  if (isValidElement(dropdownTitleOption)) {
    dropdownTitle = (dropdownTitleOption.props as OptionProp<T>).children;
  }

  return (
    <div className="flexRow" style={{ margin: margin }}>
      {label ? (
        <div className="flexGrow leftAlignedText verticalCenterItems">
          {label}
        </div>
      ) : null}
      <Dropdown
        alignment={dropdownAlignment}
        buttonClass={className}
        dropdownButton={
          <div className="flexRow verticalCenterItems">
            <span className="selectValue">{dropdownTitle}</span>
            <img src={dropdownIcon} className="smallIcon"></img>
          </div>
        }
        onOpenChange={onOpenChange}
      >
        <div className={`selectContent ${listStyle}`}>
          {childrenArr.map((child, index) => {
            if (!isValidElement(child)) {
              return null;
            }

            const option = child.props as OptionProp<T>;

            const isSelected = index === current.index;

            return (
              <button
                className={`${isSelected ? "selected" : ""} padding ${
                  option.className
                }`}
                key={child.key}
                onClick={() => setValue(option.value as T, index)}
              >
                {option.children}
              </button>
            );
          })}
        </div>
      </Dropdown>
    </div>
  );
}

function getInitialCurrentState<T extends ValueType>(
  defaultValue: T,
  children: ReactNode
) {
  if (defaultValue === undefined) {
    const child = Children.toArray(children)[0];

    return {
      value: isValidElement(child)
        ? (child.props as OptionProp<T>).value
        : undefined,
      index: 0,
    };
  }

  return {
    value: defaultValue,
    index: getIndexOf(defaultValue, children),
  };
}

function getIndexOf<T extends ValueType>(value: T, children: ReactNode) {
  let retIndex: number | undefined;
  Children.forEach(children, (child, index) => {
    if (!isValidElement(child)) {
      return;
    }

    const option = child.props as OptionProp<T>;

    if (option.value === value) {
      retIndex = index;
      return;
    }
  });

  return retIndex;
}

export default Select;
