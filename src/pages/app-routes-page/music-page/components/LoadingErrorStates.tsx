import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
    return (
        <div className="flex items-center justify-center h-96 bg-gray-900 min-h-full">
            <LoadingSpinner />
            {message && <p className="ml-4 text-zinc-400">{message}</p>}
        </div>
    );
}

interface ErrorStateProps {
    message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
    return (
        <div className="flex items-center justify-center h-96 bg-gray-900 min-h-full">
            <p className="text-red-400">{message}</p>
        </div>
    );
}
