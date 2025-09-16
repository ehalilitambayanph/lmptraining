import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Upload, Copy, ExternalLink, FileSpreadsheet, CheckCircle } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import LZString from 'lz-string';

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
  const [products, setProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploaded' | 'error'>('idle');
  
  // Check if in view-only mode (for trainees)
  const urlParams = new URLSearchParams(window.location.search);
  const isViewOnly = urlParams.get('mode') === 'trainee';

  // Load data from URL (share) or localStorage on mount
  useEffect(() => {
    try {
      // Prefer compressed data in URL hash (does not hit the server)
      const hash = window.location.hash || '';
      const hashMatch = hash.match(/data=([^&]+)/);
      if (hashMatch && hashMatch[1]) {
        const decompressed = LZString.decompressFromEncodedURIComponent(hashMatch[1]);
        if (decompressed) {
          const shared = JSON.parse(decompressed);
          if (Array.isArray(shared)) {
            setProducts(shared as ProductData[]);
            localStorage.setItem('salesTrainingProducts', JSON.stringify(shared));
            setUploadStatus('uploaded');
            setSelectedProduct(shared[0] || null);
            return; // Skip localStorage path when shared data is present
          }
        }
      }

      // Legacy fallback: data in query string (could be long)
      const sharedDataParam = urlParams.get('data');
      if (sharedDataParam) {
        const shared = JSON.parse(decodeURIComponent(sharedDataParam));
        if (Array.isArray(shared)) {
          setProducts(shared as ProductData[]);
          localStorage.setItem('salesTrainingProducts', JSON.stringify(shared));
          setUploadStatus('uploaded');
          setSelectedProduct(shared[0] || null);
          return; // Skip localStorage path when shared data is present
        }
      }
    } catch (e) {
      console.error('Failed to load shared data from link:', e);
      toast.error('Failed to load shared data. Ask trainer to resend link.');
    }

    const savedProducts = localStorage.getItem('salesTrainingProducts');
    const savedSelectedId = localStorage.getItem('selectedProductId');
    
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts);
      setProducts(parsedProducts);
      setUploadStatus('uploaded');
      
      if (savedSelectedId && parsedProducts.length > 0) {
        const product = parsedProducts.find((p: ProductData) => p['Product Name'] === savedSelectedId);
        if (product) {
          setSelectedProduct(product);
        } else {
          setSelectedProduct(parsedProducts[0]);
        }
      }
    }
  }, []);

  // Save selected product to localStorage
  useEffect(() => {
    if (selectedProduct) {
      localStorage.setItem('selectedProductId', selectedProduct['Product Name']);
    }
  }, [selectedProduct]);

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
        
        setProducts(jsonData);
        localStorage.setItem('salesTrainingProducts', JSON.stringify(jsonData));
        setUploadStatus('uploaded');
        
        if (jsonData.length > 0) {
          setSelectedProduct(jsonData[0]);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        setUploadStatus('error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredProducts = products.filter(product =>
    product['Product Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product['Definition (Simple)']?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateShareLink = () => {
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(products));
    const shareUrl = `${window.location.origin}/?mode=trainee#data=${compressed}`;
    copyToClipboard(shareUrl);
    toast.success('View-only link copied to clipboard! Note: App must be published for trainees to access without login.');
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
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://chat.whatsapp.com/KOiszYwZudR519lSjcXQS9', '_blank')}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                >
                  Join us on WhatsApp
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/'}
                  className="text-sm"
                >
                  Product Training
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/training-activity'}
                  className="text-sm"
                >
                  Training Activity
                </Button>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* File Upload Section - Only show if no data exists and not in view-only mode */}
        {!isViewOnly && products.length === 0 && (
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Product Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-muted-foreground">
                  Upload an Excel (.xlsx) or CSV file containing your product information to get started.
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

        {/* Share Link Section - Only show for trainers when data is uploaded */}
        {!isViewOnly && products.length > 0 && (
          <Card className="mb-6 border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  <span className="font-medium text-primary">
                    Share with trainees
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateShareLink}
                  className="border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy View-Only Link
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Share this link with trainees so they can view the product data without upload access.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Upload Success Message */}
        {uploadStatus === 'uploaded' && products.length > 0 && (
          <Card className="mb-6 border-success/20 bg-success/5 shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Successfully loaded {products.length} products
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {products.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 bg-card shadow-card">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="scripts">Call Scripts</TabsTrigger>
              <TabsTrigger value="emails">Email Sequences</TabsTrigger>
              <TabsTrigger value="profiles">Profiles & Positioning</TabsTrigger>
              <TabsTrigger value="cabin">Cabin</TabsTrigger>
              <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
              <TabsTrigger value="tax-update">Tax Update</TabsTrigger>
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

                    <TabsContent value="cabin" className="mt-0">
                      <Card className="shadow-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ExternalLink className="h-5 w-5" />
                            BMP Cabin Files
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-12 text-center">
                          <p className="text-muted-foreground mb-6">
                            Access cabin files and documentation on Notion
                          </p>
                          <Button
                            variant="default"
                            size="lg"
                            onClick={() => window.open('https://www.notion.so/BMP-Cabin-Files-254d5611bd3d8002b54af6d695a10282?source=copy_link', '_blank')}
                            className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-primary/25"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Cabin Files
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="chatbot" className="mt-0">
                      <Card className="shadow-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ExternalLink className="h-5 w-5" />
                            LMP Sales Bot
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-12 text-center space-y-4">
                          <p className="text-muted-foreground mb-4">
                            Get instant sales assistance from our AI chatbot
                          </p>
                          <div className="bg-muted/50 p-4 rounded-lg border">
                            <p className="text-sm font-medium mb-2">Chatbot Link:</p>
                            <code className="text-sm bg-background p-2 rounded border block mb-3 break-all">
                              https://chatgpt.com/g/g-68aee7938a248191b828af46f71b5f83-lmp-sales-bot
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard('https://chatgpt.com/g/g-68aee7938a248191b828af46f71b5f83-lmp-sales-bot')}
                              className="mb-2"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong>Instructions:</strong> Copy the link above and paste it into a new browser tab to access the sales bot.
                          </p>
                        </CardContent>
                      </Card>
                     </TabsContent>

                     <TabsContent value="tax-update" className="mt-0">
                       <Card className="shadow-card">
                         <CardHeader>
                           <CardTitle className="text-xl mb-2">Tax Update: Ledmyplace States</CardTitle>
                           <p className="text-muted-foreground">States where we collect taxes</p>
                         </CardHeader>
                         <CardContent className="space-y-6">
                           <div>
                             <h3 className="font-semibold mb-4">Current Tax Collection States</h3>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                               {[
                                 'Pennsylvania', 'New Jersey', 'Kentucky', 'Florida', 'Illinois', 'Maryland',
                                 'North Carolina', 'Ohio', 'Texas', 'Michigan', 'Louisiana', 'Iowa',
                                 'Washington', 'Minnesota', 'Georgia', 'Indiana', 'Tennessee', 'Wisconsin', 'Virginia'
                               ].map((state) => (
                                 <Badge key={state} variant="outline" className="justify-center p-2">
                                   {state}
                                 </Badge>
                               ))}
                             </div>
                             
                             <h3 className="font-semibold mb-3 text-amber-600 dark:text-amber-400">Coming Soon</h3>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                               {['Arkansas', 'Missouri'].map((state) => (
                                 <Badge key={state} variant="secondary" className="justify-center p-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                   {state}
                                 </Badge>
                               ))}
                             </div>
                           </div>
                           
                           <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                             <h3 className="font-semibold text-primary">Important Tax Information</h3>
                             <div className="space-y-3 text-sm">
                               <div className="flex items-start gap-2">
                                 <span className="text-primary font-medium">•</span>
                                 <span>Taxes are collected based on the <strong>shipping address</strong></span>
                               </div>
                               <div className="flex items-start gap-2">
                                 <span className="text-primary font-medium">•</span>
                                 <span>Shopify collects taxes on <strong>shipping fees</strong> as well</span>
                               </div>
                               <div className="flex items-start gap-2">
                                 <span className="text-primary font-medium">•</span>
                                 <span>We accept a <strong>resale certificate</strong> to mark a customer tax-exempt</span>
                               </div>
                               <div className="flex items-start gap-2">
                                 <span className="text-primary font-medium">•</span>
                                 <span>Resale certificates must be <strong>approved by our accountant</strong></span>
                               </div>
                               <div className="flex items-start gap-2">
                                 <span className="text-primary font-medium">•</span>
                                 <span>For questions, reach out to <strong>@Ayan Alam</strong></span>
                               </div>
                             </div>
                           </div>
                         </CardContent>
                       </Card>
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