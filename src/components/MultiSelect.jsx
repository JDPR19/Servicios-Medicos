import React from 'react';
import Select from 'react-select';


    const customSelectStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#ffffff',
        borderColor: state.isFocused ? '#0033A0' : '#99d6ea',
        borderRadius: 8,
        minHeight: 38,
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
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#99d6ea',
        borderRadius: 8,
        color: '#242424',
        fontFamily: "'Roboto', sans-serif",
        fontSize: 14,
        maxWidth: 140, 
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: '#242424',
        fontFamily: "'Roboto', sans-serif",
        fontSize: 14,
        maxWidth: 110, // Limita el ancho del texto
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'inline-block',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: '#0033A0',
        borderRadius: 8,
        ':hover': {
        backgroundColor: '#0033A0',
        color: '#fff',
        },
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#adb5bd',
        fontFamily: "'Roboto', sans-serif",
        fontSize: 14,
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#fff',
        borderRadius: 8,
        zIndex: 20,
        border: '1.5px solid #99d6ea',
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
    };

    const MultiSelect = ({
    options,
    value,
    onChange,
    placeholder = "Selecciona...",
    isMulti = true,
    ...props
    }) => (
    <Select
        isMulti={isMulti}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={customSelectStyles}
        menuPortalTarget={document.body}
        {...props}
    />
    );

export default MultiSelect;