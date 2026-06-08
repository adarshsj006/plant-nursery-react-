export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePlantForm = (formData) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = 'Plant name is required';
  } else if (formData.name.length < 2) {
    errors.name = 'Plant name must be at least 2 characters';
  }

  if (!formData.category) {
    errors.category = 'Category is required';
  }

  if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
    errors.price = 'Valid price is required';
  }

  if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
    errors.stock = 'Valid stock quantity is required';
  }

  if (!formData.description.trim()) {
    errors.description = 'Description is required';
  } else if (formData.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (!formData.careLevel) {
    errors.careLevel = 'Care level is required';
  }

  if (!formData.sunlight.trim()) {
    errors.sunlight = 'Sunlight requirements are required';
  }

  if (!formData.waterNeeds.trim()) {
    errors.waterNeeds = 'Water needs are required';
  }

  return errors;
};

export const validateUserForm = (formData) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }

  if (formData.password && !validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};