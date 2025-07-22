import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfirmDeleteModalProps {
    userName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDeleteModal = ({ userName, onConfirm, onCancel }: ConfirmDeleteModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <Card className="w-full max-w-md mx-4 shadow-2xl border-0 animate-scale-in">
                <CardHeader className="border-b bg-gradient-to-r from-red-50 to-red-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-red-600">Delete User</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onCancel}>
                            <X className="h-4 w-4 text-gray-600" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <p className="text-gray-800">
                        Are you sure you want to delete <span className="font-semibold">{userName}</span>?
                        <br />
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={onConfirm}
                        >
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
