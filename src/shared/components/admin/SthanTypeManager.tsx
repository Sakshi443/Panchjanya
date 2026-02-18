// src/components/admin/SthanTypeManager.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Plus, Trash2, Pencil, GripVertical } from 'lucide-react';
import { getSthanTypes, createSthanType, updateSthanType, deleteSthanType, generateSthanPinSVG } from '@/shared/utils/sthanTypes';
import { SthanType, PinType } from '@/shared/types/sthanType';
import { useToast } from '@/shared/hooks/use-toast';

const PIN_OPTIONS: { value: PinType; label: string; previewSrc: string }[] = [
    {
        value: 'default',
        label: 'Default Pin',
        previewSrc: '', // generated dynamically
    },
    {
        value: 'aasan_sthan',
        label: 'Aasan Sthan Pin',
        previewSrc: '/icons/Aasan Sthan pin.svg',
    },
    {
        value: 'mahasthan',
        label: 'Mahasthan Pin',
        previewSrc: '/icons/mahasthan pin.png',
    },
];

export function SthanTypeManager() {
    const [open, setOpen] = useState(false);
    const [sthanTypes, setSthanTypes] = useState<SthanType[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [color, setColor] = useState('#000000');
    const [pinType, setPinType] = useState<PinType>('default');

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
                await updateSthanType(editingId, { name, color, pinType });
                toast({
                    title: 'Success',
                    description: 'Sthan type updated successfully',
                });
            } else {
                const order = sthanTypes.length + 1;
                await createSthanType({ name, color, order, pinType });
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
        setPinType(type.pinType || 'default');
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
        setPinType('default');
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

                        {/* Pin Type Selector */}
                        <div className="space-y-2">
                            <Label>Pin Type</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {PIN_OPTIONS.map((option) => {
                                    const previewUrl = option.value === 'default'
                                        ? generateSthanPinSVG(color, 'default')
                                        : option.previewSrc;

                                    // For custom images, we use them directly. For default/Aasan Sthan (SVG), we use the helper if needed or direct path.
                                    // generateSthanPinSVG handles default and aasan_sthan (if we pass color).
                                    // But here we want a static preview for selection? 
                                    // Actually, let's use generateSthanPinSVG for all if possible, or fallback to option.previewSrc

                                    let displaySrc = previewUrl;
                                    if (option.value === 'aasan_sthan') {
                                        // Use the colored version for preview
                                        displaySrc = generateSthanPinSVG(color, 'aasan_sthan');
                                    } else if (option.value === 'mahasthan') {
                                        // Use the static PNG
                                        displaySrc = option.previewSrc;
                                    }

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setPinType(option.value)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${pinType === option.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                        >
                                            <img
                                                src={displaySrc}
                                                alt={option.label}
                                                className="w-10 h-10 object-contain"
                                            />
                                            <span className="text-xs font-medium text-slate-700">
                                                {option.label}
                                            </span>
                                            {pinType === option.value && (
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                                                    Selected
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
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
                                        {/* Pin preview with color */}
                                        <img
                                            src={generateSthanPinSVG(type.color, type.pinType)}
                                            alt={type.pinType === 'aasan_sthan' ? 'Aasan Sthan Pin' : 'Default Pin'}
                                            className="w-8 h-8 object-contain flex-shrink-0"
                                        // title={`${type.pinType === 'aasan_sthan' ? 'Aasan Sthan' : 'Default'} pin · ${type.color}`}
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{type.name}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <span
                                                    className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300"
                                                    style={{ backgroundColor: type.color }}
                                                />
                                                {type.color}
                                                <span className="text-slate-300">·</span>
                                                <span>
                                                    {type.pinType === 'aasan_sthan' ? 'Aasan Sthan' :
                                                        type.pinType === 'mahasthan' ? 'Mahasthan' : 'Default'}
                                                </span>
                                            </div>
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
