import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Video, FileText, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
import curriculumService from '../services/curriculumService';
import { useToast } from '../../../components/feedback/Toast';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/common/Button';
import LessonEditorModal from './LessonEditorModal';

// Sortable Module Item
const SortableModule = ({ module, courseId, onAddLesson, onEditLesson, onDeleteLesson, onDeleteModule }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id });
  const [expanded, setExpanded] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-lg mb-4 overflow-hidden shadow-sm">
      {/* Module Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
            <GripVertical size={20} />
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-500">
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <h3 className="font-semibold text-gray-800 m-0">{module.title}</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onAddLesson(module.id)} className="text-sm text-blue-600 font-medium px-2 py-1 hover:bg-blue-50 rounded flex items-center gap-1">
            <Plus size={16} /> Add Lesson
          </button>
          <button onClick={() => onDeleteModule(module.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Module Content (Lessons) */}
      {expanded && (
        <div className="p-4 bg-white space-y-2">
          {module.lessons?.length > 0 ? (
            module.lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-3 border rounded bg-gray-50 hover:bg-gray-100 group">
                <div className="flex items-center gap-3">
                  {lesson.lessonType === 'VIDEO' ? <Video size={18} className="text-gray-500" /> : <FileText size={18} className="text-gray-500" />}
                  <span className="text-gray-700 font-medium">{lesson.title}</span>
                  {lesson.freePreview && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Free Preview</span>}
                </div>
                <div className="flex items-center gap-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs">{lesson.durationMinutes || 0} min</span>
                  <button onClick={() => onEditLesson(module.id, lesson)} className="hover:text-blue-600"><Edit2 size={16} /></button>
                  <button onClick={() => onDeleteLesson(module.id, lesson.id)} className="hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic m-0">No lessons in this module. Click "Add Lesson" to get started.</p>
          )}
        </div>
      )}
    </div>
  );
};

export const CurriculumBuilder = ({ course }) => {
  const [modules, setModules] = useState(course?.modules || []);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  const [addingLessonTo, setAddingLessonTo] = useState(null); // moduleId
  const [newLessonData, setNewLessonData] = useState({ title: '', lessonType: 'VIDEO' });
  const [editingLesson, setEditingLesson] = useState(null); // { moduleId, lesson }

  const toast = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setModules((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      
      const newArray = arrayMove(items, oldIndex, newIndex);
      // In a real app, send update to backend here to save sort_order
      return newArray;
    });
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      const res = await curriculumService.addModule(course.id, { title: newModuleTitle, sortOrder: modules.length });
      setModules([...modules, { ...res, lessons: [] }]);
      setNewModuleTitle('');
      setIsAddingModule(false);
      toast.success('Module added');
      queryClient.invalidateQueries(['courses', course.id]);
    } catch (e) {
      toast.error('Failed to add module');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    try {
      await curriculumService.deleteModule(course.id, moduleId);
      setModules(modules.filter(m => m.id !== moduleId));
      toast.success('Module deleted');
    } catch (e) {
      toast.error('Failed to delete module');
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonData.title.trim()) return;
    const targetModule = modules.find(m => m.id === addingLessonTo);
    try {
      const res = await curriculumService.addLesson(course.id, addingLessonTo, {
        title: newLessonData.title,
        lessonType: newLessonData.lessonType,
        sortOrder: targetModule.lessons?.length || 0
      });
      
      setModules(modules.map(m => {
        if (m.id === addingLessonTo) {
          return { ...m, lessons: [...(m.lessons || []), res] };
        }
        return m;
      }));
      setAddingLessonTo(null);
      setNewLessonData({ title: '', lessonType: 'VIDEO' });
      toast.success('Lesson added');
    } catch (e) {
      toast.error('Failed to add lesson');
    }
  };

  const handleSaveLesson = async (updatedLesson) => {
    try {
      const res = await curriculumService.updateLesson(course.id, editingLesson.moduleId, updatedLesson.id, {
        title: updatedLesson.title,
        lessonType: updatedLesson.lessonType,
        content: updatedLesson.content,
        recordingId: updatedLesson.recordingId,
        sortOrder: updatedLesson.sortOrder,
        durationMinutes: updatedLesson.durationMinutes,
        freePreview: updatedLesson.freePreview
      });
      
      setModules(modules.map(m => {
        if (m.id === editingLesson.moduleId) {
          return { ...m, lessons: m.lessons.map(l => l.id === res.id ? res : l) };
        }
        return m;
      }));
      setEditingLesson(null);
      toast.success('Lesson updated');
    } catch (e) {
      toast.error('Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await curriculumService.deleteLesson(course.id, moduleId, lessonId);
      setModules(modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      }));
      toast.success('Lesson deleted');
    } catch (e) {
      toast.error('Failed to delete lesson');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 m-0">Course Curriculum</h2>
        <Button onClick={() => setIsAddingModule(true)} variant="primary" size="sm">
          <Plus size={16} className="mr-2" /> Add Module
        </Button>
      </div>

      {isAddingModule && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-6 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
            <input 
              autoFocus
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" 
              value={newModuleTitle} 
              onChange={(e) => setNewModuleTitle(e.target.value)} 
              placeholder="e.g. Introduction to Illustrator"
            />
          </div>
          <Button onClick={handleAddModule} disabled={!newModuleTitle.trim()}>Save Module</Button>
          <Button onClick={() => setIsAddingModule(false)} variant="outline">Cancel</Button>
        </div>
      )}

      {addingLessonTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] shadow-xl">
            <h3 className="text-lg font-bold mb-4">Add New Lesson</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  className="w-full border border-gray-300 rounded-md p-2" 
                  value={newLessonData.title}
                  onChange={(e) => setNewLessonData({...newLessonData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newLessonData.lessonType}
                  onChange={(e) => setNewLessonData({...newLessonData, lessonType: e.target.value})}
                >
                  <option value="VIDEO">Video Lesson</option>
                  <option value="TEXT">Text / Article</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setAddingLessonTo(null)} variant="outline">Cancel</Button>
              <Button onClick={handleAddLesson} disabled={!newLessonData.title.trim()}>Add Lesson</Button>
            </div>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
          {modules.map((module) => (
            <SortableModule 
              key={module.id} 
              module={module} 
              courseId={course.id} 
              onAddLesson={setAddingLessonTo}
              onEditLesson={(moduleId, lesson) => setEditingLesson({ moduleId, lesson })}
              onDeleteLesson={handleDeleteLesson}
              onDeleteModule={handleDeleteModule}
            />
          ))}
          {modules.length === 0 && !isAddingModule && (
            <div className="text-center py-12 bg-gray-50 border-2 border-dashed rounded-lg">
              <p className="text-gray-500 mb-4">Your course currently has no curriculum.</p>
              <Button onClick={() => setIsAddingModule(true)} variant="outline">Create First Module</Button>
            </div>
          )}
        </SortableContext>
      </DndContext>

      {editingLesson && (
        <LessonEditorModal 
          courseId={course.id} 
          moduleId={editingLesson.moduleId} 
          lesson={editingLesson.lesson} 
          onClose={() => setEditingLesson(null)} 
          onSave={handleSaveLesson} 
        />
      )}
    </div>
  );
};

export default CurriculumBuilder;
