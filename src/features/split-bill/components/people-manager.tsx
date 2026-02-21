import { useState } from 'react';
import { Person } from '../types';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PeopleManagerProps {
    people: Person[];
    onAddPerson: (name: string) => void;
    onRemovePerson: (id: string) => void;
}

export function PeopleManager({ people, onAddPerson, onRemovePerson }: PeopleManagerProps) {
    const [nameInput, setNameInput] = useState('');

    const handleAdd = () => {
        if (nameInput.trim()) {
            onAddPerson(nameInput);
            setNameInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <Users className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-800">People Sharing</h3>
                <span className="ml-auto text-xs font-bold bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full">
                    {people.length}
                </span>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter name (e.g., Alice)"
                    className="flex-1 h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
                <Button
                    onClick={handleAdd}
                    disabled={!nameInput.trim()}
                    className="h-10 px-4 bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                >
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    Add
                </Button>
            </div>

            {people.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                    <AnimatePresence>
                        {people.map(person => (
                            <motion.div
                                key={person.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, width: 0, margin: 0, padding: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-1.5 pr-3 py-1.5 shadow-sm"
                            >
                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white", person.avatarColor)}>
                                    {person.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                    {person.name}
                                </span>
                                <button
                                    onClick={() => onRemovePerson(person.id)}
                                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50"
                                    title={`Remove ${person.name}`}
                                >
                                    <UserMinus className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-6 px-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">No people added yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Add who&apos;s sharing to start splitting items.</p>
                </div>
            )}
        </div>
    );
}
