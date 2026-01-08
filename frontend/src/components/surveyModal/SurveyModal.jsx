import { useState } from 'react';
import Modal from '../modal/Modal';
import Input from '../input/Input';
import Button from '../button/Button';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import toast from 'react-hot-toast';

const QUESTIONS = [
  "Over the last 2 weeks, how often have you felt down, depressed, or hopeless?",
  "Have you had little interest or pleasure in doing things?",
  "How often do you feel nervous, anxious, or on edge?",
  "Have you been unable to stop or control worrying?",
  "Do you have trouble falling or staying asleep, or sleeping too much?",
  "Have you felt tired or had little energy?",
  "Have you had a poor appetite or overeating?",
  "Have you felt bad about yourself - or that you are a failure or have let yourself down?",
  "Do you have trouble concentrating on things, such as reading or watching TV?",
  "Have you had thoughts that you would be better off dead, or of hurting yourself?"
];

export default function SurveyModal({ isOpen, onClose, inmateId = 1 }) {
  const [currentStep, setCurrentStep] = useState(0); // 0-9 for questions
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < 9) {
      // Save current answer
      if (currentAnswer.trim()) {
        const questionData = {
          question: QUESTIONS[currentStep],
          answer: currentAnswer.trim()
        };
        
        // Update or add answer at current index
        const newAnswers = [...answers];
        newAnswers[currentStep] = questionData;
        setAnswers(newAnswers);
        
        // Move to next step
        setCurrentStep(currentStep + 1);
        
        // Pre-fill next answer if it exists
        if (newAnswers[currentStep + 1]) {
          setCurrentAnswer(newAnswers[currentStep + 1].answer);
        } else {
          setCurrentAnswer('');
        }
      } else {
        toast.error('Please provide an answer before proceeding');
      }
    } else if (currentStep === 9) {
      // Last question - save answer
      if (currentAnswer.trim()) {
        const questionData = {
          question: QUESTIONS[currentStep],
          answer: currentAnswer.trim()
        };
        const newAnswers = [...answers];
        newAnswers[currentStep] = questionData;
        setAnswers(newAnswers);
        // Don't move to next step, stay on last question to show submit button
      } else {
        toast.error('Please provide an answer before proceeding');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Save current answer before going back
      if (currentAnswer.trim()) {
        const questionData = {
          question: QUESTIONS[currentStep],
          answer: currentAnswer.trim()
        };
        const newAnswers = [...answers];
        newAnswers[currentStep] = questionData;
        setAnswers(newAnswers);
      }
      
      // Calculate the previous step
      const previousStep = currentStep - 1;
      
      // Go to previous step
      setCurrentStep(previousStep);
      
      // Restore previous answer if available
      if (answers[previousStep]) {
        setCurrentAnswer(answers[previousStep].answer);
      } else {
        setCurrentAnswer('');
      }
    }
  };

  const handleSubmit = async () => {
    // Save current answer if on last question
    if (currentAnswer.trim() && currentStep === 9) {
      const questionData = {
        question: QUESTIONS[currentStep],
        answer: currentAnswer.trim()
      };
      const newAnswers = [...answers];
      newAnswers[currentStep] = questionData;
      setAnswers(newAnswers);
    }

    // Ensure we have all 10 answers
    let finalAnswers = [...answers];
    if (currentStep === 9 && currentAnswer.trim()) {
      finalAnswers[9] = { question: QUESTIONS[9], answer: currentAnswer.trim() };
    }

    if (finalAnswers.length !== 10) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data in the required format
      const surveyData = {
        inmate_id: inmateId,
        answers: finalAnswers
      };

      // Send answers to API
      await axiosInstance.post('http://127.0.0.1:5010/api/inmate/submit_survey', surveyData);

      toast.success('Survey submitted successfully!');
      handleClose();
    } catch (error) {
      console.error('Error submitting survey:', error);
      const msg = error?.response?.data?.message || 'Failed to submit survey. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setCurrentStep(0);
    setAnswers([]);
    setCurrentAnswer('');
    onClose();
  };

  const isLastQuestion = currentStep === 9;
  const currentQuestionNumber = currentStep + 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Survey"
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Progress</span>
              <span>{currentQuestionNumber}/10</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Step */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Question {currentQuestionNumber}
            </h3>
            <p className="text-base text-slate-700 mb-6">
              {QUESTIONS[currentStep]}
            </p>
          </div>

          <Input
            type="text"
            label="Your Answer"
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            required
          />

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!currentAnswer.trim() || isSubmitting}
                loading={isSubmitting}
              >
                <CheckCircle className="w-4 h-4" />
                Submit
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!currentAnswer.trim()}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

