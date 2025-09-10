import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Upload, Copy, ExternalLink, FileSpreadsheet, CheckCircle } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import DepartmentToggle from '@/components/DepartmentToggle';
import * as XLSX from 'xlsx';

interface ProductData {
  'Product URL': string;
  'Product Name': string;
  'Definition (Simple)': string;
  'Expanded Explanation': string;
  'Common Uses': string;
  'Common Customer Profiles': string;
  'Positioning (vs Competitors)': string;
  'Cold Call Script': string;
  'Cold Email - Sequence 1': string;
  'Cold Email - Sequence 2': string;
  'Cold Email - Sequence 3': string;
  'Cold Email - Sequence 4': string;
  'Cold Email - Sequence 5': string;
  'Possible Customer Objections': string;
  'Rebuttals to Objections': string;
}

export default function SalesTrainingViewer() {
  const [department, setDepartment] = useState<'LMP' | 'BMP'>('LMP');
  const [lmpProducts, setLmpProducts] = useState<ProductData[]>([]);
  const [bmpProducts, setBmpProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [lmpUploadStatus, setLmpUploadStatus] = useState<'idle' | 'uploaded' | 'error'>('idle');
  const [bmpUploadStatus, setBmpUploadStatus] = useState<'idle' | 'uploaded' | 'error'>('idle');

  // Helper functions to get current department data
  const getCurrentProducts = () => department === 'LMP' ? lmpProducts : bmpProducts;
  const getCurrentUploadStatus = () => department === 'LMP' ? lmpUploadStatus : bmpUploadStatus;
  const setCurrentProducts = (products: ProductData[]) => {
    if (department === 'LMP') {
      setLmpProducts(products);
    } else {
      setBmpProducts(products);
    }
  };
  const setCurrentUploadStatus = (status: 'idle' | 'uploaded' | 'error') => {
    if (department === 'LMP') {
      setLmpUploadStatus(status);
    } else {
      setBmpUploadStatus(status);
    }
  };

  // Load data from localStorage on mount
  useEffect(() => {
    // Load LMP data
    const savedLmpProducts = localStorage.getItem('salesTrainingProducts_LMP');
    const savedLmpSelectedId = localStorage.getItem('selectedProductId_LMP');
    
    if (savedLmpProducts) {
      const parsedLmpProducts = JSON.parse(savedLmpProducts);
      setLmpProducts(parsedLmpProducts);
      setLmpUploadStatus('uploaded');
    }

    // Load BMP data
    const savedBmpProducts = localStorage.getItem('salesTrainingProducts_BMP');
    const savedBmpSelectedId = localStorage.getItem('selectedProductId_BMP');
    
    if (savedBmpProducts) {
      const parsedBmpProducts = JSON.parse(savedBmpProducts);
      setBmpProducts(parsedBmpProducts);
      setBmpUploadStatus('uploaded');
    }

    // Load saved department
    const savedDepartment = localStorage.getItem('selectedDepartment') as 'LMP' | 'BMP';
    if (savedDepartment) {
      setDepartment(savedDepartment);
    }
  }, []);

  // Load selected product when department changes
  useEffect(() => {
    const currentProducts = getCurrentProducts();
    const savedSelectedId = localStorage.getItem(`selectedProductId_${department}`);
    
    if (savedSelectedId && currentProducts.length > 0) {
      const product = currentProducts.find((p: ProductData) => p['Product Name'] === savedSelectedId);
      if (product) {
        setSelectedProduct(product);
      } else {
        setSelectedProduct(currentProducts[0]);
      }
    } else if (currentProducts.length > 0) {
      setSelectedProduct(currentProducts[0]);
    } else {
      setSelectedProduct(null);
    }
  }, [department, lmpProducts, bmpProducts]);

  // Save selected product to localStorage
  useEffect(() => {
    if (selectedProduct) {
      localStorage.setItem(`selectedProductId_${department}`, selectedProduct['Product Name']);
    }
  }, [selectedProduct, department]);

  // Save department to localStorage
  useEffect(() => {
    localStorage.setItem('selectedDepartment', department);
  }, [department]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ProductData[];
        
        setCurrentProducts(jsonData);
        localStorage.setItem(`salesTrainingProducts_${department}`, JSON.stringify(jsonData));
        setCurrentUploadStatus('uploaded');
        
        if (jsonData.length > 0) {
          setSelectedProduct(jsonData[0]);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        setCurrentUploadStatus('error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredProducts = getCurrentProducts().filter(product =>
    product['Product Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product['Definition (Simple)']?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCustomerProfiles = (profilesText: string) => {
    if (!profilesText) return [];
    return profilesText.split(',').map(profile => profile.trim()).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/a861675f-582f-4b42-80ff-16343ef6836f.png" 
                alt="Company Logo" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sales Training Viewer</h1>
                <p className="text-muted-foreground">Product information and sales resources</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Department Toggle */}
        <div className="mb-6">
          <DepartmentToggle department={department} onDepartmentChange={setDepartment} />
        </div>
        {/* File Upload Section */}
        {getCurrentUploadStatus() === 'idle' && (
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload {department} Product Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-muted-foreground">
                  Upload an Excel (.xlsx) or CSV file containing your {department} product information to get started.
                </p>
                <Input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary-hover"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Success Message */}
        {getCurrentUploadStatus() === 'uploaded' && getCurrentProducts().length > 0 && (
          <Card className="mb-6 border-success/20 bg-success/5 shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Successfully loaded {getCurrentProducts().length} {department} products
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {getCurrentProducts().length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-card shadow-card">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="scripts">Call Scripts</TabsTrigger>
              <TabsTrigger value="emails">Email Sequences</TabsTrigger>
              <TabsTrigger value="profiles">Profiles & Positioning</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar - Product List */}
              <div className="lg:col-span-1">
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-0 focus-visible:ring-0 px-0"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredProducts.map((product, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                            selectedProduct?.['Product Name'] === product['Product Name']
                              ? 'bg-gradient-to-r from-success/10 to-success/15 border-success shadow-lg shadow-success/20 scale-[1.02]'
                              : 'hover:bg-success/5 hover:border-success/30 hover:scale-105 hover:shadow-md border-transparent'
                          }`}
                          onClick={() => setSelectedProduct(product)}
                        >
                          <h4 className="font-medium text-sm mb-1">{product['Product Name']}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {product['Definition (Simple)']}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Content - Product Details */}
              <div className="lg:col-span-2">
                {selectedProduct ? (
                  <>
                    <TabsContent value="products" className="mt-0">
                      <Card className="shadow-card">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl mb-2">{selectedProduct['Product Name']}</CardTitle>
                              <p className="text-muted-foreground">{selectedProduct['Definition (Simple)']}</p>
                            </div>
                            {selectedProduct['Product URL'] && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => window.open(selectedProduct['Product URL'], '_blank')}
                                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-primary/25"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Check Product
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h3 className="font-semibold mb-3">Expanded Explanation</h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {selectedProduct['Expanded Explanation'] || 'No detailed explanation available.'}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-3">Common Uses</h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {selectedProduct['Common Uses'] || 'No common uses listed.'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="scripts" className="mt-0">
                      <div className="space-y-4">
                        <Card className="shadow-card">
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Cold Call Script</CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(selectedProduct['Cold Call Script'] || '')}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                              {selectedProduct['Cold Call Script'] || 'No script available.'}
                            </pre>
                          </CardContent>
                        </Card>

                        <Card className="shadow-card">
                          <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Objections & Rebuttals</CardTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(
                                `Objections: ${selectedProduct['Possible Customer Objections'] || ''}\n\nRebuttals: ${selectedProduct['Rebuttals to Objections'] || ''}`
                              )}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Possible Objections</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedProduct['Possible Customer Objections'] || 'No objections listed.'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Rebuttals</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedProduct['Rebuttals to Objections'] || 'No rebuttals available.'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="emails" className="mt-0">
                      <Card className="shadow-card">
                        <CardHeader>
                          <CardTitle>Email Sequences</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            {[1, 2, 3, 4, 5].map((num) => {
                              const emailKey = `Cold Email - Sequence ${num}` as keyof ProductData;
                              const emailContent = selectedProduct[emailKey];
                              
                              return (
                                <AccordionItem key={num} value={`sequence-${num}`}>
                                  <AccordionTrigger className="text-left">
                                    <div className="flex items-center gap-2">
                                      <span>Email Sequence {num}</span>
                                      {emailContent && (
                                        <Badge variant="secondary" className="ml-auto">
                                          Available
                                        </Badge>
                                      )}
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="flex items-start justify-between gap-4">
                                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground flex-1">
                                        {emailContent || 'No email sequence available.'}
                                      </pre>
                                      {emailContent && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => copyToClipboard(emailContent)}
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="profiles" className="mt-0">
                      <div className="space-y-4">
                        <Card className="shadow-card">
                          <CardHeader>
                            <CardTitle>Customer Profiles</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {getCustomerProfiles(selectedProduct['Common Customer Profiles'] || '').map((profile, index) => (
                                <Badge key={index} variant="secondary">
                                  {profile}
                                </Badge>
                              ))}
                              {getCustomerProfiles(selectedProduct['Common Customer Profiles'] || '').length === 0 && (
                                <p className="text-muted-foreground">No customer profiles available.</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="shadow-card">
                          <CardHeader>
                            <CardTitle>Common Uses</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">
                              {selectedProduct['Common Uses'] || 'No common uses listed.'}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="shadow-card">
                          <CardHeader>
                            <CardTitle>Positioning vs Competitors</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">
                              {selectedProduct['Positioning (vs Competitors)'] || 'No positioning information available.'}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </>
                ) : (
                  <Card className="shadow-card">
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">Select a product to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
}