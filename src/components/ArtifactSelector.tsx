import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type ArtifactModule = {
    default: React.ComponentType;
};

interface Artifact {
    name: string;
    component: React.ComponentType;
}

const ArtifactSelector = () => {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const discoveredArtifacts = import.meta.glob<ArtifactModule>('/src/artifacts/*.tsx');

        Promise.all(
            Object.entries(discoveredArtifacts).map(async ([path, importFn]) => {
                const name = path.split('/').pop()?.replace('.tsx', '') || '';
                const module = await importFn();
                return {
                    name,
                    component: module.default
                } as Artifact;
            })
        ).then(loadedArtifacts => {
            setArtifacts(loadedArtifacts);
            if (loadedArtifacts.length > 0) {
                setSelectedArtifact(loadedArtifacts[0]);
            }
        });
    }, []);

    const SelectedComponent = selectedArtifact?.component;

    return (
        <div className="w-full mx-auto p-4">
            <div className="relative mb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-2 text-left border rounded-md bg-white shadow-sm hover:bg-gray-50"
                >
                    <span>{selectedArtifact?.name || 'Select a component'}</span>
                    <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10">
                        {artifacts.map((artifact) => (
                            <button
                                key={artifact.name}
                                className="w-full p-2 text-left hover:bg-gray-100"
                                onClick={() => {
                                    setSelectedArtifact(artifact);
                                    setIsOpen(false);
                                }}
                            >
                                {artifact.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="border rounded-lg p-4 bg-white">
                {SelectedComponent ? (
                    <SelectedComponent />
                ) : (
                    <div className="text-gray-500 text-center">No component selected</div>
                )}
            </div>
        </div>
    );
};

export default ArtifactSelector;