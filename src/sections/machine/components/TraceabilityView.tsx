import { useState } from 'react'
import { 
  Search, 
  QrCode, 
  Download, 
  ExternalLink,
  Package,
  Wrench,
  ClipboardCheck,
  Truck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const mockMaterials = [
  {
    id: 'MAT-001',
    name: 'PP-H350',
    code: 'PP-001',
    batch: 'B2024-0156',
    receiptDate: '2024-01-15',
    supplier: 'Polymer Solutions Inc',
    qualityStatus: 'Approved',
    quantity: '1500 kg'
  },
  {
    id: 'MAT-002', 
    name: 'ABS-HG47',
    code: 'ABS-002',
    batch: 'B2024-0178',
    receiptDate: '2024-01-18',
    supplier: 'Advanced Plastics Ltd',
    qualityStatus: 'Pending',
    quantity: '1200 kg'
  }
]

const mockMolding = [
  {
    id: 'MOL-001',
    machine: 'M001',
    product: 'Housing-A',
    mold: 'M-2024-001',
    batch: 'B2024-0156',
    date: '2024-01-20',
    qty: 2400,
    condition: 'High Speed'
  },
  {
    id: 'MOL-002',
    machine: 'M002', 
    product: 'Cover-B',
    mold: 'M-2024-003',
    batch: 'B2024-0178',
    date: '2024-01-21',
    qty: 1800,
    condition: 'Standard'
  }
]

const mockInspection = [
  {
    id: 'INS-001',
    date: '2024-01-20',
    count: 2400,
    rejects: 24,
    defectRate: 1.0,
    inspector: 'John Smith'
  },
  {
    id: 'INS-002',
    date: '2024-01-21', 
    count: 1800,
    rejects: 36,
    defectRate: 2.0,
    inspector: 'Maria Garcia'
  }
]

const mockAssembly = [
  {
    id: 'ASM-001',
    date: '2024-01-22',
    station: 'Line-A St.1',
    operator: 'David Chen',
    output: 2376,
    defectRate: 0.5
  },
  {
    id: 'ASM-002',
    date: '2024-01-23',
    station: 'Line-B St.2', 
    operator: 'Sarah Wilson',
    output: 1764,
    defectRate: 0.8
  }
]

const mockDelivery = [
  {
    id: 'DEL-001',
    dueDate: '2024-01-25',
    product: 'Housing Assembly',
    batch: 'FA-2024-001',
    instruction: 'Ship to Customer A',
    carrier: 'Express Logistics'
  },
  {
    id: 'DEL-002',
    dueDate: '2024-01-26',
    product: 'Cover Assembly',
    batch: 'FA-2024-002', 
    instruction: 'Ship to Customer B',
    carrier: 'Standard Freight'
  }
]

export function TraceabilityView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('materials')

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Material & Product Traceability</CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR/Barcode
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Generate Certificate
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by batch number, product code, or material name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Master List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Material Batches</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              {mockMaterials.map((material) => (
                <div
                  key={material.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedMaterial === material.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedMaterial(material.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{material.name}</p>
                      <p className="text-sm text-muted-foreground">{material.batch}</p>
                    </div>
                    <Badge 
                      variant={material.qualityStatus === 'Approved' ? 'default' : 'secondary'}
                    >
                      {material.qualityStatus}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {material.supplier} • {material.quantity}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail Tables */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedMaterial ? `Details for ${mockMaterials.find(m => m.id === selectedMaterial)?.name}` : 'Select a material batch'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {selectedMaterial ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="materials" className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Material
                    </TabsTrigger>
                    <TabsTrigger value="molding" className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      Molding
                    </TabsTrigger>
                    <TabsTrigger value="inspection" className="flex items-center gap-1">
                      <ClipboardCheck className="h-3 w-3" />
                      Inspection
                    </TabsTrigger>
                    <TabsTrigger value="assembly" className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      Assembly
                    </TabsTrigger>
                    <TabsTrigger value="delivery" className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Delivery
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="materials" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead>Receipt Date</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockMaterials.filter(m => m.id === selectedMaterial).map((material) => (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium">{material.name}</TableCell>
                            <TableCell>{material.code}</TableCell>
                            <TableCell>{material.batch}</TableCell>
                            <TableCell>{material.receiptDate}</TableCell>
                            <TableCell>{material.supplier}</TableCell>
                            <TableCell>
                              <Badge variant={material.qualityStatus === 'Approved' ? 'default' : 'secondary'}>
                                {material.qualityStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="molding" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Machine</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Mold</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Condition</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockMolding.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.machine}</TableCell>
                            <TableCell>{record.product}</TableCell>
                            <TableCell>{record.mold}</TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.qty.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.condition}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="inspection" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>Rejects</TableHead>
                          <TableHead>Defect Rate</TableHead>
                          <TableHead>Inspector</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockInspection.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.count.toLocaleString()}</TableCell>
                            <TableCell>{record.rejects}</TableCell>
                            <TableCell>
                              <span className={record.defectRate > 1.5 ? 'text-red-600' : 'text-green-600'}>
                                {record.defectRate}%
                              </span>
                            </TableCell>
                            <TableCell>{record.inspector}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="assembly" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Station/Line</TableHead>
                          <TableHead>Operator</TableHead>
                          <TableHead>Output</TableHead>
                          <TableHead>Defect Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockAssembly.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.station}</TableCell>
                            <TableCell>{record.operator}</TableCell>
                            <TableCell>{record.output.toLocaleString()}</TableCell>
                            <TableCell>
                              <span className={record.defectRate > 1.0 ? 'text-red-600' : 'text-green-600'}>
                                {record.defectRate}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="delivery" className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead>Instruction</TableHead>
                          <TableHead>Carrier</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockDelivery.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.dueDate}</TableCell>
                            <TableCell>{record.product}</TableCell>
                            <TableCell>{record.batch}</TableCell>
                            <TableCell>{record.instruction}</TableCell>
                            <TableCell>{record.carrier}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a material batch from the left to view detailed traceability information</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lineage Visualization */}
      {selectedMaterial && (
        <Card>
          <CardHeader>
            <CardTitle>Material Flow Lineage</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    M
                  </div>
                  <p className="text-xs mt-1">Material</p>
                  <p className="text-xs text-muted-foreground">PP-H350</p>
                </div>
                
                <div className="w-8 h-0.5 bg-muted-foreground" />
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                    P
                  </div>
                  <p className="text-xs mt-1">Production</p>
                  <p className="text-xs text-muted-foreground">2,400 pcs</p>
                </div>
                
                <div className="w-8 h-0.5 bg-muted-foreground" />
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white font-medium">
                    Q
                  </div>
                  <p className="text-xs mt-1">Quality</p>
                  <p className="text-xs text-muted-foreground">1.0% defect</p>
                </div>
                
                <div className="w-8 h-0.5 bg-muted-foreground" />
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    A
                  </div>
                  <p className="text-xs mt-1">Assembly</p>
                  <p className="text-xs text-muted-foreground">2,376 units</p>
                </div>
                
                <div className="w-8 h-0.5 bg-muted-foreground" />
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                    S
                  </div>
                  <p className="text-xs mt-1">Shipment</p>
                  <p className="text-xs text-muted-foreground">Ready</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Flow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}