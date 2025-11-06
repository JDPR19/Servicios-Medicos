export const validateField = (value, regex, errorMessage) => {
    if(typeof value !== 'string') 
        return { valid: true, message: ''};
    if(!value.trim()) {
        return {valid: false, message: 'No Puede Dejar El Campo Vacío'};
    }
    if (typeof value === 'string' && value.length > 200) {
        return {valid: false, message: 'No puede ingresar más de 200 caracteres'};
    }
    if(!regex.text(value)) {
        return {valid: false, message: errorMessage};
    }
    return {valid: true, message: ''};
};

export const campos = [
    {id:'correo', tipo:'email'},
];

export const getValidationRule = (field) => {
    const campo = campos.find(c => c.id === field);
    if(campo && validationRules[campo.tipo]){
        return validationRules[campo.tipo];
    }
    if (validationRules[field]) {
        return validationRules[field];
    }
    return null;
};


export const validationRules = {
    cedula: {
        regex: /^(V-|E-)?\d{7,8}$/, 
        errorMessage: 'La cédula debe tener 7 u 8 dígitos, con o sin prefijo V- o E-'
    },

    nombre: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        errorMessage: 'El nombre solo puede contener letras y espacios'
    },

    apellido: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        errorMessage: 'El apellido solo puede contener letras y espacios'
    },

    contacto: {
        regex: /^04\d{2}-\d{7}$/, // Ejemplo: 0412-1234567
        errorMessage: 'El contacto debe tener el formato 04XX-XXXXXXX'
    },

    profesion: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, // Solo letras y espacios
        errorMessage: 'La profesión solo puede contener letras y espacios'
    },

    email: {
        regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Formato de correo válido
        errorMessage: 'El correo debe tener un formato válido, por ejemplo: usuario@dominio.com'
    },

    username: {
        regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.()%+@#,!;:]+$/,
        errorMessage: 'Debe colocar un nombre de usuario válido'
    },

    letras: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ-]+$/,
        errorMessage: 'Solo se permiten letras, guiones y sin espacios'
    },

     codigo: {
        regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]+$/,
        errorMessage: 'Debe escribir un formato válido'
    },

    numeros: {
        regex: /^\d+$/,
        errorMessage: 'Solo se permiten números'
    },

    fecha: {
        regex: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
        errorMessage: 'La fecha debe tener el formato dd/mm/yyyy'
    },

    direccion: {
        regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#.,-]+$/,
        errorMessage: 'La dirección solo puede contener letras, números y los símbolos # . , -'
    },

    password: {
        // regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        regex: /^.{6,}$/,
        errorMessage: 'La contraseña debe tener al menos 6 caracteres'
    },

    confirmarpassword: {
        validate: (value, originalPassword) => {
            if (!value.trim()){
                return {valid: false, message: 'Debe confirmar la contraseña'};
            }
            if (value !== originalPassword) {
                return {valid: false, message: 'Las contraseñas no coinciden'};
            }
            return {valid: true, message: ''};
        }
    }
};