// src/components/admin/SthanTypeManager.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Plus, Trash2, Pencil, GripVertical } from 'lucide-react';
import { getSthanTypes, createSthanType, updateSthanType, deleteSthanType, generateColoredPinSVG, getSthanPinInfo, updateSthanTypesOrder } from '@/shared/utils/sthanTypes';
import { SthanType, PinType } from '@/shared/types/sthanType';
import { useToast } from '@/shared/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const COLOR_SETS = [
    { value: '#0e3c6f', label: 'Blue', series: 'blue' },
    { value: '#d4af37', label: 'Golden', series: 'gold' },
] as const;

type IconKey = 'empty' | 'temple' | 'shikhara' | 'mandir' | 'asan' | 'dot';

const PIN_MAP: Record<typeof COLOR_SETS[number]['series'], Record<IconKey, PinType>> = {
    blue: {
        empty: 'pin_empty',
        temple: 'pin_temple1',
        shikhara: 'pin_shikhara',
        mandir: 'pin_mandir',
        asan: 'pin_aasan',
        dot: 'pin_dot'
    },
    gold: {
        empty: 'pin_empty_gold',
        temple: 'pin_1_1',
        shikhara: 'pin_1_2',
        mandir: 'pin_1_3',
        asan: 'pin_1_4',
        dot: 'pin_1_5'
    }
};

const ICON_OPTIONS: { key: IconKey; label: string }[] = [
    { key: 'temple', label: 'Temple' },
    { key: 'shikhara', label: 'Shikhara' },
    { key: 'mandir', label: 'Mandir' },
    { key: 'asan', label: 'Aasan' },
    { key: 'dot', label: 'Dot' },
    { key: 'empty', label: 'Empty' },
];



export function SthanTypeManager() {
    const [open, setOpen] = useState(false);
    const [sthanTypes, setSthanTypes] = useState<SthanType[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [color, setColor] = useState('#d4af37'); // Default to Golden
    const [pinType, setPinType] = useState<PinType>('pin_1_1'); // Default to Golden Temple

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
        setPinType(type.pinType || 'pin_empty');
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

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) return;

        const reorderedTypes = Array.from(sthanTypes);
        const [removed] = reorderedTypes.splice(sourceIndex, 1);
        reorderedTypes.splice(destinationIndex, 0, removed);

        // Optimistic update
        setSthanTypes(reorderedTypes);

        try {
            await updateSthanTypesOrder(reorderedTypes);
            toast({
                title: 'Success',
                description: 'Order updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update order',
                variant: 'destructive',
            });
            loadSthanTypes(); // Revert on failure
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setColor('#d4af37');
        setPinType('pin_1_1');
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
                                <Label htmlFor="color">Color Set *</Label>
                                <div className="flex gap-3">
                                    {COLOR_SETS.map((set) => (
                                        <button
                                            key={set.series}
                                            type="button"
                                            onClick={() => {
                                                const currentIconKey = (Object.entries(PIN_MAP.blue).find(([_, v]) => v === pinType)?.[0] ||
                                                    Object.entries(PIN_MAP.gold).find(([_, v]) => v === pinType)?.[0] ||
                                                    'temple') as IconKey;
                                                setColor(set.value);
                                                setPinType(PIN_MAP[set.series][currentIconKey]);
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${color === set.value
                                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full border border-slate-300"
                                                style={{ backgroundColor: set.value }}
                                            />
                                            <span className="text-sm font-medium">{set.label}</span>
                                            {color === set.value && (
                                                <span className="text-[10px] font-bold text-blue-600 uppercase ml-auto">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Pin Icon Type</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {ICON_OPTIONS.map((option) => {
                                    const currentSeries = COLOR_SETS.find(s => s.value === color)?.series || 'gold';
                                    const specificPinType = PIN_MAP[currentSeries][option.key];
                                    return (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() => setPinType(specificPinType)}
                                            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${pinType === specificPinType
                                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            {(() => {
                                                const { src } = getSthanPinInfo('original', specificPinType);
                                                return (
                                                    <div className="relative w-10 h-10">
                                                        <div
                                                            className="absolute inset-0 bg-white"
                                                            style={{ clipPath: 'circle(40% at 50% 40%)' }}
                                                        />
                                                        <img
                                                            src={src}
                                                            alt={option.label}
                                                            className="relative z-10 w-full h-full object-contain"
                                                        />
                                                    </div>
                                                );
                                            })()}
                                            <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">
                                                {option.label}
                                            </span>
                                            {pinType === specificPinType && (
                                                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">✓ Selected</span>
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
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="sthan-types">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-2"
                                        >
                                            {sthanTypes.map((type, index) => (
                                                <Draggable key={type.id} draggableId={type.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg transition-all ${snapshot.isDragging ? 'shadow-lg border-blue-200 z-50' : 'hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div {...provided.dragHandleProps} className="p-1 hover:bg-slate-100 rounded cursor-grab">
                                                                <GripVertical className="w-4 h-4 text-slate-400" />
                                                            </div>
                                                            {(() => {
                                                                const { src, filter } = getSthanPinInfo(type.color, type.pinType);
                                                                return (
                                                                    <div className="relative w-8 h-8 flex-shrink-0">
                                                                        <div
                                                                            className="absolute inset-0 bg-white"
                                                                            style={{ clipPath: 'circle(40% at 50% 40%)' }}
                                                                        />
                                                                        <img
                                                                            src={src}
                                                                            style={filter ? { filter } : undefined}
                                                                            alt={type.name}
                                                                            className="relative z-10 w-full h-full object-contain"
                                                                        />
                                                                    </div>
                                                                );
                                                            })()}
                                                            <div className="flex-1">
                                                                <div className="font-medium text-sm">{type.name}</div>
                                                                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                                                    <span
                                                                        className="inline-block w-2.5 h-2.5 rounded-full border border-slate-300"
                                                                        style={{ backgroundColor: type.color }}
                                                                    />
                                                                    {type.color}
                                                                    <span className="text-slate-300">·</span>
                                                                    {(() => {
                                                                        const iconKey = Object.entries(PIN_MAP.blue).find(([_, v]) => v === type.pinType)?.[0] ||
                                                                            Object.entries(PIN_MAP.gold).find(([_, v]) => v === type.pinType)?.[0] ||
                                                                            'custom';
                                                                        const iconLabel = ICON_OPTIONS.find(o => o.key === iconKey)?.label || 'Custom';
                                                                        const seriesLabel = COLOR_SETS.find(s => s.value === type.color)?.label || 'Custom';
                                                                        return `${seriesLabel} - ${iconLabel}`;
                                                                    })()}
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
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
