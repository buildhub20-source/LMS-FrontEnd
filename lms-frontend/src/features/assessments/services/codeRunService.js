import { http } from '../../../services/api/axiosInstance';

/** Server-side runs for languages the browser cannot execute (Java, Python, C, C++). */
export const codeRunService = {
  run: (language, sourceCode, inputs) => http.post('/code/run', { language, sourceCode, inputs }),
};

export default codeRunService;
