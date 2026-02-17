// src/components/admin/SthanTypeManager.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Plus, Trash2, Pencil, GripVertical } from 'lucide-react';
import { getSthanTypes, createSthanType, updateSthanType, deleteSthanType } from '@/shared/utils/sthanTypes';
import { SthanType } from '@/shared/types/sthanType';
import { useToast } from '@/shared/hooks/use-toast';

export function SthanTypeManager() {
    const [open, setOpen] = useState(false);
    const [sthanTypes, setSthanTypes] = useState<SthanType[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [color, setColor] = useState('#000000');

    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            loadSthanTypes();
        }
    }, [open]);

    const loadSthanTypes = async () => {
        setLoading(true);
        try {
            const types = await getSthanTypes();
            setSthanTypes(types);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load sthan types',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a sthan type name',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                await updateSthanType(editingId, { name, color });
                toast({
                    title: 'Success',
                    description: 'Sthan type updated successfully',
                });
            } else {
                const order = sthanTypes.length + 1;
                await createSthanType({ name, color, order });
                toast({
                    title: 'Success',
                    description: 'Sthan type created successfully',
                });
            }

            resetForm();
            loadSthanTypes();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save sthan type',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (type: SthanType) => {
        setEditingId(type.id);
        setName(type.name);
        setColor(type.color);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sthan type? This cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            await deleteSthanType(id);
            toast({
                title: 'Success',
                description: 'Sthan type deleted successfully',
            });
            loadSthanTypes();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete sthan type',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setColor('#000000');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Manage Sthan Types
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Sthan Types</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Add/Edit Form */}
                    <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-4">
                        <h3 className="font-semibold text-sm text-slate-700">
                            {editingId ? 'Edit Sthan Type' : 'Add New Sthan Type'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Avasthan"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color">Color *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-20 h-10 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
                            </Button>
                            {editingId && (
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* List of Sthan Types */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-slate-700">Existing Sthan Types</h3>
                        {loading && sthanTypes.length === 0 ? (
                            <div className="text-sm text-slate-500 py-8 text-center">Loading...</div>
                        ) : sthanTypes.length === 0 ? (
                            <div className="text-sm text-slate-500 py-8 text-center">
                                No sthan types yet. Add one above.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sthanTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                                        <div
                                            className="w-6 h-6 rounded border border-slate-300"
                                            style={{ backgroundColor: type.color }}
                                            title={type.color}
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{type.name}</div>
                                            <div className="text-xs text-slate-500">{type.color}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(type)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(type.id)}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
