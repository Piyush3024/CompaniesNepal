
export const cleanObject = (obj: Record<string, any>): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    )
  );
};

export const cleanFormData = (obj: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(obj).forEach(([key, value]) => {
    // Always include boolean fields, even if false
    if (typeof value === 'boolean') {
      formData.append(key, String(value));
    }
    // Include non-empty values
    else if (value !== null && value !== undefined && value !== '') {
      if (value instanceof File) {
        // Handle file uploads
        formData.append(key, value);
        console.log(`Appended file: ${key}`, value.name, value.size);
      } else {
        // Handle regular form fields
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
};


// export const cleanFormData = (obj: Record<string, any>): Record<string, any> => {
//   const cleanedData: Record<string, any> = {};
  
//   Object.entries(obj).forEach(([key, value]) => {
//     // Handle arrays (like education_records)
//     if (Array.isArray(value)) {
//       cleanedData[key] = value.map(item => {
//         if (typeof item === 'object' && item !== null) {
//           return cleanFormData(item); // Recursively clean array items
//         }
//         return item;
//       });
//     }
//     // Handle objects (but not Files)
//     else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
//       cleanedData[key] = cleanFormData(value);
//     }
//     // Handle booleans (always include)
//     else if (typeof value === 'boolean') {
//       cleanedData[key] = value;
//     }
//     // Handle Files (keep as-is for file uploads)
//     else if (value instanceof File) {
//       cleanedData[key] = value;
//     }
//     // Include non-empty values
//     else if (value !== null && value !== undefined && value !== '') {
//       cleanedData[key] = value;
//     }
//   });
  
//   return cleanedData;
// };