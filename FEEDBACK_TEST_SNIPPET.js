// Test trigger for FeedbackModal
// Add this button temporarily to your dashboard to test the feedback modal:

// 1. Add state at top of DashboardClient:
const [showFeedbackModal, setShowFeedbackModal] = useState(false);

// 2. Add handler function:
const handleFeedbackSubmit = async (rating: number, comment?: string) => {
    try {
        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/feedback`,
            {
                rating,
                comment,
                trigger: "manual"
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Thank you for your feedback!");
        setShowFeedbackModal(false);
    } catch (error) {
        console.error("Failed to submit feedback:", error);
        toast.error("Failed to submit feedback. Please try again.");
    }
};

// 3. Add test button to your dashboard (e.g., near the Profile button):
<button
  onClick={() => setShowFeedbackModal(true)}
  className="px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold shadow-md"
>
  Test Feedback
</button>

// 4. Add FeedbackModal component before the closing fragment:
<FeedbackModal
  isOpen={showFeedbackModal}
  onClose={() => setShowFeedbackModal(false)}
  onSubmit={handleFeedbackSubmit}
  trigger="manual"
/>

// This gives you a manual "Test Feedback" button to trigger the modal anytime!
