import { useState, useCallback } from 'react';

export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name] && validate) {
      const errs = validate({ ...values, [name]: value });
      setErrors(prev => ({ ...prev, [name]: errs[name] || '' }));
    }
  }, [values, touched, validate]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    if (validate) {
      const errs = validate(values);
      setErrors(prev => ({ ...prev, [name]: errs[name] || '' }));
    }
  }, [values, validate]);

  const setFieldError = useCallback((name, msg) => {
    setErrors(prev => ({ ...prev, [name]: msg }));
  }, []);

  const setFieldErrors = useCallback((fieldErrors) => {
    if (fieldErrors) setErrors(prev => ({ ...prev, ...fieldErrors }));
  }, []);

  const isValid = useCallback(() => {
    if (!validate) return true;
    const errs = validate(values);
    setErrors(errs);
    setTouched(Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    return Object.values(errs).every(v => !v);
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, handleChange, handleBlur, setFieldError, setFieldErrors, isValid, reset, setValues };
}