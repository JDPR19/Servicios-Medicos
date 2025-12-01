import React from 'react';
import Select from 'react-select';


const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#ffffff',
        borderColor: state.isFocused ? '#0033A0' : '#99d6ea',
        borderRadius: 8,
        minHeight: 38,
        maxWidth: '100%',
        boxSizing: 'border-box',
        boxShadow: state.isFocused ? '0 0 0 2px #99d6ea55' : 'none',
        transition: 'all 0.3s ease',
        fontFamily: "'Roboto', sans-serif",
        fontSize: 15,
        color: '#242424',
        '&:hover': {
            borderColor: '#0033A0',
        },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#e7f1ff'
            : state.isFocused
                ? '#99d6ea'
                : '#fff',
        color: '#242424',
        fontFamily: "'Roboto', sans-serif",
        fontSize: 15,
        cursor: 'pointer',
        padding: 8,
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#adb5bd',
        fontFamily: "'Roboto', sans-serif",
        fontSize: 14
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#fff',
        borderRadius: 8,
        zIndex: 20,
        border: '1.5px solid #99d6ea',
        // minWidth: 120,
        // maxWidth: 180,
    }),
    menuList: (provided) => ({
        ...provided,
        maxHeight: 160,
        overflowY: 'auto'
    }),
    menuPortal: base => ({
        ...base,
        zIndex: 19999,
    }),
    input: (provided) => ({
        ...provided,
        color: '#242424',
        fontFamily: "'Roboto', sans-serif",
        fontSize: 15,
    }),
    singleValue: (provided) => ({
        ...provided,
        maxWidth: 180,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
    }),
};

const SingleSelect = ({
    options,
    value,
    onChange,
    placeholder = "Selecciona...",
    isClearable = true,
    ...props
}) => (
    <Select
        isMulti={false}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={customSelectStyles}
        isClearable={isClearable}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        {...props}
    />
);

export default SingleSelect;