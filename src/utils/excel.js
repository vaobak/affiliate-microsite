import * as XLSX from 'xlsx';
import { getItems, saveItems } from './storage';

// Export products to Excel
export function exportProductsToExcel() {
  const products = getItems();
  
  // Prepare data for Excel
  const excelData = products.map(product => ({
    'ID': product.id,
    'Product Name': product.name,
    'Category': product.category || 'Uncategorized',
    'Affiliate Link': product.url,
    'Badge': product.badge || '',
    'Clicks': product.clicks || 0,
    'Created At': product.createdAt || ''
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // ID
    { wch: 30 }, // Product Name
    { wch: 20 }, // Category
    { wch: 50 }, // Affiliate Link
    { wch: 15 }, // Badge
    { wch: 10 }, // Clicks
    { wch: 25 }  // Created At
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `affiliate-products-${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
  
  return { success: true, filename };
}

// Import products from Excel - REPLACE MODE (replace all existing products)
export function importProductsReplace(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          reject(new Error('File Excel kosong atau tidak valid'));
          return;
        }

        // Process imported data - REPLACE ALL
        const newProducts = [];
        const errors = [];
        
        jsonData.forEach((row, index) => {
          // Validate required fields
          const productId = row['ID'] || row['id'];
          const productName = row['Product Name'] || row['product name'] || row['name'];
          const affiliateLink = row['Affiliate Link'] || row['affiliate link'] || row['url'] || row['link'];
          
          if (!productId || !productName || !affiliateLink) {
            errors.push(`Baris ${index + 2}: ID, Product Name, dan Affiliate Link wajib diisi`);
            return;
          }

          // Create product with specified ID
          newProducts.push({
            id: parseInt(productId),
            name: productName.trim(),
            url: affiliateLink.trim(),
            category: (row['Category'] || row['category'] || 'Uncategorized').trim(),
            badge: (row['Badge'] || row['badge'] || '').trim(),
            clicks: parseInt(row['Clicks'] || row['clicks'] || 0),
            createdAt: new Date().toISOString()
          });
        });

        if (errors.length > 0) {
          reject(new Error(errors.join('\n')));
          return;
        }

        // REPLACE all products
        saveItems(newProducts);

        resolve({
          success: true,
          mode: 'replace',
          imported: newProducts.length,
          total: newProducts.length
        });
        
      } catch (error) {
        reject(new Error('Gagal membaca file Excel: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Import products from Excel - NEW MODE (add new products only)
export function importProductsNew(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          reject(new Error('File Excel kosong atau tidak valid'));
          return;
        }

        // Get existing products
        const existingProducts = getItems();
        const maxId = existingProducts.length > 0 
          ? Math.max(...existingProducts.map(p => p.id)) 
          : 0;

        // Process imported data - ADD NEW ONLY
        const newProducts = [];
        const errors = [];
        
        jsonData.forEach((row, index) => {
          // Validate required fields
          const productName = row['Product Name'] || row['product name'] || row['name'];
          const affiliateLink = row['Affiliate Link'] || row['affiliate link'] || row['url'] || row['link'];
          
          if (!productName || !affiliateLink) {
            errors.push(`Baris ${index + 2}: Product Name dan Affiliate Link wajib diisi`);
            return;
          }

          // Create new product with auto-increment ID
          newProducts.push({
            id: maxId + newProducts.length + 1,
            name: productName.trim(),
            url: affiliateLink.trim(),
            category: (row['Category'] || row['category'] || 'Uncategorized').trim(),
            badge: (row['Badge'] || row['badge'] || '').trim(),
            clicks: parseInt(row['Clicks'] || row['clicks'] || 0),
            createdAt: new Date().toISOString()
          });
        });

        if (errors.length > 0) {
          reject(new Error(errors.join('\n')));
          return;
        }

        // ADD new products to existing
        const allProducts = [...existingProducts, ...newProducts];
        saveItems(allProducts);

        resolve({
          success: true,
          mode: 'new',
          imported: newProducts.length,
          total: allProducts.length
        });
        
      } catch (error) {
        reject(new Error('Gagal membaca file Excel: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Download template Excel for REPLACE mode
export function downloadTemplateReplace() {
  const templateData = [
    {
      'ID': 1,
      'Product Name': 'Contoh Produk 1',
      'Category': 'Fashion Pria',
      'Affiliate Link': 'https://example.com/product1',
      'Badge': 'PROMO',
      'Clicks': 0
    },
    {
      'ID': 2,
      'Product Name': 'Contoh Produk 2',
      'Category': 'Elektronik',
      'Affiliate Link': 'https://example.com/product2',
      'Badge': 'DISKON',
      'Clicks': 0
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // ID
    { wch: 30 }, // Product Name
    { wch: 20 }, // Category
    { wch: 50 }, // Affiliate Link
    { wch: 15 }, // Badge
    { wch: 10 }  // Clicks
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  XLSX.writeFile(workbook, 'template-import-replace.xlsx');
  
  return { success: true };
}

// Download template Excel for NEW mode
export function downloadTemplateNew() {
  const templateData = [
    {
      'Product Name': 'Contoh Produk Baru 1',
      'Category': 'Fashion Pria',
      'Affiliate Link': 'https://example.com/product1',
      'Badge': 'NEW',
      'Clicks': 0
    },
    {
      'Product Name': 'Contoh Produk Baru 2',
      'Category': 'Elektronik',
      'Affiliate Link': 'https://example.com/product2',
      'Badge': 'HOT',
      'Clicks': 0
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 30 }, // Product Name
    { wch: 20 }, // Category
    { wch: 50 }, // Affiliate Link
    { wch: 15 }, // Badge
    { wch: 10 }  // Clicks
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  XLSX.writeFile(workbook, 'template-import-new.xlsx');
  
  return { success: true };
}
