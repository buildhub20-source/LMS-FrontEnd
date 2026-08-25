import React, { useState, useRef } from 'react';
import Button from '../../../components/common/Button';
import { useToast } from '../../../components/feedback/Toast';
import courseService from '../services/courseService';
import axios from 'axios';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

export default function LessonEditorModal({ courseId, moduleId, lesson, onClose, onSave }) {
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content || '');
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(!!lesson.recordingId);
  const fileInputRef = useRef(null);
  
  const toast = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Only video files are supported');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // 1. Get presigned URL
      const { uploadUrl, recordingId } = await courseService.getLessonUploadUrl(courseId, moduleId, lesson.id, {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      });

      // 2. Upload file directly to R2
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      setUploadSuccess(true);
      toast.success('Video uploaded successfully!');
      
      // Save the updated lesson state locally
      onSave({ ...lesson, recordingId });

    } catch (error) {
      console.error(error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSave({ ...lesson, title, content });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[600px] shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Edit Lesson: {lesson.title}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              className="w-full border border-gray-300 rounded-md p-2" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {lesson.lessonType === 'VIDEO' && (
            <div className="border border-gray-200 rounded p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">Video Content</label>
              
              {uploadSuccess ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded border border-green-200">
                  <CheckCircle2 size={20} />
                  <span>Video has been uploaded successfully.</span>
                  <button onClick={() => setUploadSuccess(false)} className="ml-auto text-sm underline hover:text-green-800">Replace</button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => !uploading && fileInputRef.current?.click()}
                >
                  <UploadCloud size={32} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">Click to select video file</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, WebM, or MOV up to 2GB</p>
                  
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="video/*" 
                    onChange={handleFileChange} 
                  />
                  
                  {uploading && (
                    <div className="w-full mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {lesson.lessonType === 'TEXT' && (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Article Content</label>
               <textarea 
                 className="w-full border border-gray-300 rounded-md p-2 h-32" 
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 placeholder="Write your article here..."
               />
             </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onClose} variant="outline">Close</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
