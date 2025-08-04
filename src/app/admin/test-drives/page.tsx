"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { TrashIcon, ArrowUturnLeftIcon, CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon, PlusIcon, PencilIcon, FunnelIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@/components/ui/admin-layout";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types for test drive appointments
interface TestDrive {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  model: string;
  status: string;
  createdAt: string;
}

// Types for car management
interface Car {
  id: number;
  model: string;
  brand: string;
  year: string;
  color: string;
  price: string;
  status: "Available" | "In Use" | "Maintenance" | "Sold";
  description?: string;
  imageUrl?: string;
}

// Helper components
const statusOptions = ["Pending", "Confirmed", "Completed", "Canceled", "No Show"];
const statusIcons = {
  Pending: <ClockIcon className="h-6 w-6 text-yellow-500" />,
  Confirmed: <CheckCircleIcon className="h-6 w-6 text-blue-500" />,
  Completed: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  Canceled: <XCircleIcon className="h-6 w-6 text-gray-400" />,
  "No Show": <XCircleIcon className="h-6 w-6 text-red-500" />,
};

const carStatusOptions = ["Available", "In Use", "Maintenance", "Sold"];
const carStatusColors = {
  Available: "bg-green-100 text-green-800",
  "In Use": "bg-blue-100 text-blue-800",
  Maintenance: "bg-yellow-100 text-yellow-800",
  Sold: "bg-gray-100 text-gray-800",
};

function StatusSummary({ testDrives }: { testDrives: TestDrive[] }) {
  const counts = useMemo(() => {
    return statusOptions.reduce((acc, status) => {
      acc[status] = testDrives.filter(td => td.status === status).length;
      return acc;
    }, {} as Record<string, number>);
  }, [testDrives]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {statusOptions.map(status => (
        <div key={status} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            {statusIcons[status as keyof typeof statusIcons]}
            <div>
              <div className="text-2xl font-bold text-gray-900">{counts[status]}</div>
              <div className="text-sm font-medium text-gray-600">{status}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Car Management Components
function AddCarDialog({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (car: Omit<Car, 'id'>) => void }) {
  const [formData, setFormData] = useState({
    model: "",
    brand: "",
    year: "",
    color: "",
    price: "",
    status: "Available" as Car['status'],
    description: "",
    imageUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      model: "",
      brand: "",
      year: "",
      color: "",
      price: "",
      status: "Available",
      description: "",
      imageUrl: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Car</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="e.g., $25,000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Car['status'] })}
              className="w-full p-2 border rounded"
            >
              {carStatusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Optional description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Car
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditCarDialog({ isOpen, onClose, onEdit, car }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onEdit: (id: number, car: Omit<Car, 'id'>) => void;
  car: Car | null;
}) {
  const [formData, setFormData] = useState({
    model: "",
    brand: "",
    year: "",
    color: "",
    price: "",
    status: "Available" as Car['status'],
    description: "",
    imageUrl: "",
  });

  // Update form data when car changes
  useEffect(() => {
    if (car) {
      setFormData({
        model: car.model,
        brand: car.brand,
        year: car.year,
        color: car.color,
        price: car.price,
        status: car.status,
        description: car.description || "",
        imageUrl: car.imageUrl || "",
      });
    }
  }, [car]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (car) {
      onEdit(car.id, formData);
      onClose();
    }
  };

  if (!car) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Car</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="e.g., $25,000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Car['status'] })}
              className="w-full p-2 border rounded"
            >
              {carStatusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Optional description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Update Car
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CarsTable({ cars, onDelete, onEdit }: { 
  cars: Car[]; 
  onDelete: (id: number) => void;
  onEdit: (car: Car) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand/Model</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year/Color</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cars.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <EyeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">No cars found</p>
                    <p className="text-sm">Add your first car to get started.</p>
                  </div>
                </td>
              </tr>
            ) : (
              cars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {car.imageUrl ? (
                      <img src={car.imageUrl} alt={car.model} className="w-16 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{car.brand}</div>
                    <div className="text-sm text-gray-500">{car.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{car.year}</div>
                    <div className="text-sm text-gray-500">{car.color}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{car.price}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${carStatusColors[car.status]}`}>
                      {car.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => onEdit(car)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(car.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to format date for display
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return "Invalid Date";
  }
}

// Helper function to get date for filtering
function getDateForFilter(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return "";
  }
}

export default function AdminTestDrivesPage() {
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ date: "", status: "", model: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [addCarDialogOpen, setAddCarDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'test-drives' | 'cars'>('test-drives');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editCarDialogOpen, setEditCarDialogOpen] = useState(false);
  const [carToEdit, setCarToEdit] = useState<Car | null>(null);

  const fetchTestDrives = async () => {
    try {
      const response = await fetch('/api/test-drive');
      if (response.ok) {
        const data = await response.json();
        setTestDrives(Array.isArray(data) ? data : []);
      } else {
        setError("Failed to fetch test drives");
      }
    } catch (error) {
      setError("Error fetching test drives");
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      if (response.ok) {
        const data = await response.json();
        setCars(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch cars");
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchTestDrives(),
        fetchCars()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTestDrives();
    fetchCars();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/test-drive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) {
        fetchTestDrives();
        toast.success("Test drive status updated successfully");
      } else {
        toast.error("Failed to update test drive status");
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Error updating test drive status");
    }
  };

  const handleDelete = async (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        const response = await fetch('/api/test-drive', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: itemToDelete }),
        });
        if (response.ok) {
          fetchTestDrives();
          toast.success("Test drive deleted successfully");
        } else {
          toast.error("Failed to delete test drive");
        }
      } catch (error) {
        console.error('Error deleting test drive:', error);
        toast.error("Error deleting test drive");
      } finally {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const handleAddCar = async (carData: Omit<Car, 'id'>) => {
    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData),
      });
      
      if (response.ok) {
        const newCar = await response.json();
        setCars(prev => [...prev, newCar]);
        toast.success("Car added successfully");
      } else {
        console.error("Failed to add car");
        toast.error("Failed to add car");
      }
    } catch (error) {
      console.error("Error adding car:", error);
      toast.error("Error adding car");
    }
  };

  const handleDeleteCar = async (id: number) => {
    try {
      const response = await fetch('/api/cars', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (response.ok) {
        setCars(prev => prev.filter(car => car.id !== id));
        toast.success("Car deleted successfully");
      } else {
        console.error("Failed to delete car");
        toast.error("Failed to delete car");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Error deleting car");
    }
  };

  const handleEditCar = (car: Car) => {
    setCarToEdit(car);
    setEditCarDialogOpen(true);
  };

  const handleUpdateCar = async (id: number, carData: Omit<Car, 'id'>) => {
    try {
      const response = await fetch('/api/cars', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...carData }),
      });
      if (response.ok) {
        const updatedCar = await response.json();
        setCars(prev => prev.map(car => car.id === id ? updatedCar : car));
        toast.success("Car updated successfully");
      } else {
        console.error("Failed to update car");
        toast.error("Failed to update car");
      }
    } catch (error) {
      console.error("Error updating car:", error);
      toast.error("Error updating car");
    }
  };

  const filteredTestDrives = useMemo(() => {
    const filtered = testDrives.filter(td => {
      const dateMatch = !filters.date || getDateForFilter(td.date) === filters.date;
      const statusMatch = !filters.status || td.status === filters.status;
      const modelMatch = !filters.model || td.model === filters.model;
      
      return dateMatch && statusMatch && modelMatch;
    });
    
    return filtered;
  }, [testDrives, filters]);

  const uniqueModels = useMemo(() => {
    return [...new Set(testDrives.map(td => td.model))];
  }, [testDrives]);

  const clearFilters = () => {
    setFilters({ date: "", status: "", model: "" });
  };

  if (loading) {
    return (
      <AdminLayout title="Test Drive Management" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Test Drive Management" 
      subtitle="Manage test drive requests and car inventory"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchTestDrives} className="mt-2" size="sm">
            Retry
          </Button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setActiveTab('test-drives')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'test-drives'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Test Drives
        </button>
        <button
          onClick={() => setActiveTab('cars')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'cars'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Car Management
        </button>
      </div>

      {activeTab === 'test-drives' ? (
        <>
          <StatusSummary testDrives={testDrives} />

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <FunnelIcon className="w-4 h-4" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                    <select 
                      value={filters.model} 
                      onChange={(e) => setFilters(f => ({ ...f, model: e.target.value }))} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Models</option>
                      {uniqueModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input 
                      type="date" 
                      value={filters.date} 
                      onChange={(e) => setFilters(f => ({ ...f, date: e.target.value }))} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                      value={filters.status} 
                      onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mr-2"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredTestDrives.length}</span> of <span className="font-medium">{testDrives.length}</span> test drives
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Test Drives Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTestDrives.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <EyeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">No test drives found</p>
                          <p className="text-sm">Try adjusting your filters or check back later.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTestDrives.map((td) => (
                      <tr key={td.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{td.name}</div>
                          <div className="text-sm text-gray-500">{td.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{td.model}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{formatDate(td.date)}</div>
                          <div className="text-gray-500">{td.time || "Time not specified"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{td.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={td.status}
                            onChange={(e) => handleStatusChange(td.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={td.status === "Canceled"}
                          >
                            {statusOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(td.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                            {(td.status === 'Canceled' || td.status === 'Completed' || td.status === 'No Show') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                onClick={() => handleStatusChange(td.id, 'Pending')}
                                title="Revert to Pending"
                              >
                                <ArrowUturnLeftIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Car Management Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Car Management</h2>
            <Button onClick={() => setAddCarDialogOpen(true)} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Car
            </Button>
          </div>

          <CarsTable 
            cars={cars} 
            onDelete={handleDeleteCar}
            onEdit={handleEditCar}
          />
        </>
      )}

      {/* Add Car Dialog */}
      <AddCarDialog 
        isOpen={addCarDialogOpen}
        onClose={() => setAddCarDialogOpen(false)}
        onAdd={handleAddCar}
      />

      {/* Edit Car Dialog */}
      <EditCarDialog
        isOpen={editCarDialogOpen}
        onClose={() => setEditCarDialogOpen(false)}
        onEdit={handleUpdateCar}
        car={carToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test Drive Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test drive booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
} 