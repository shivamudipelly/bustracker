import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


export const ConfirmDeleteModal = ({
    onClose,
    onConfirm,
    itemName,
}: {
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <Card className="w-full max-w-md mx-4 shadow-2xl border-0 animate-scale-in">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-red-100 rounded-full p-3 w-fit">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold mt-4">Confirm Deletion</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-gray-600 mb-8">
                        Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={onClose} className="hover:bg-gray-50">
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};