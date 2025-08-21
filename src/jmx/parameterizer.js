export class Parameterizer {
  constructor() {
    this.parameterPatterns = [
      { name: 'email', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, replacement: '${__P(email,user@example.com)}' },
      { name: 'username', regex: /^user[0-9]+$/, replacement: '${__P(username,user1)}' },
      { name: 'password', regex: /^.{6,}$/, replacement: '${__P(password,password123)}' },
      { name: 'phone', regex: /^\+?[\d\s-()]+$/, replacement: '${__P(phone,+1234567890)}' },
      { name: 'date', regex: /^\d{4}-\d{2}-\d{2}$/, replacement: '${__time(yyyy-MM-dd)}' },
      { name: 'timestamp', regex: /^\d{10,13}$/, replacement: '${__time()}' }
    ];
  }

  parameterizeRequest(request) {
    const parameterized = { ...request };
    
    // Parameterize query parameters
    if (parameterized.query) {
      parameterized.query = this.parameterizeObject(parameterized.query);
    }
    
    // Parameterize post data
    if (parameterized.postData) {
      try {
        const postData = JSON.parse(parameterized.postData);
        const parameterizedData = this.parameterizeObject(postData);
        parameterized.postData = JSON.stringify(parameterizedData);
      } catch (e) {
        // Handle form data
        const formData = new URLSearchParams(parameterized.postData);
        const parameterizedFormData = new URLSearchParams();
        
        for (const [key, value] of formData) {
          const parameterizedValue = this.parameterizeValue(key, value);
          parameterizedFormData.append(key, parameterizedValue);
        }
        
        parameterized.postData = parameterizedFormData.toString();
      }
    }
    
    return parameterized;
  }

  parameterizeObject(obj) {
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result[key] = this.parameterizeObject(value);
      } else if (typeof value === 'string') {
        result[key] = this.parameterizeValue(key, value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  parameterizeValue(key, value) {
    // Check if value matches any parameter pattern
    for (const pattern of this.parameterPatterns) {
      if (pattern.regex.test(value) || key.toLowerCase().includes(pattern.name)) {
        return pattern.replacement;
      }
    }
    
    // Check for CSV data file parameters
    if (this.shouldUseCSV(key)) {
      return `\${__CSVRead(data.csv,${key})}`;
    }
    
    return value;
  }

  shouldUseCSV(key) {
    const csvFields = ['userid', 'productid', 'orderid', 'customerid'];
    return csvFields.some(field => key.toLowerCase().includes(field));
  }
}
