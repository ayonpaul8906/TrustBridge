import React, { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore"
import { auth, firestore } from "../../firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import DashboardWrapper from "../../components/shared/DashboardWrapper"
import { HandCoins, User, Timer } from "lucide-react"
import { Button } from "../../components/ui/button"
import { toast } from "sonner"

export default function LoanRequests() {
  const [user] = useAuthState(auth)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch loan requests for current lender
  useEffect(() => {
    if (!user) return

    const fetchRequests = async () => {
      try {
        const q = query(
          collection(firestore, "loanRequests"),
          where("lenderId", "==", user.uid)
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setRequests(data)
      } catch (error) {
        console.error("Error fetching loan requests:", error)
        toast.error("Failed to load loan requests.")
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [user])

  const updateStatus = async (id, status) => {
    try {
      const requestRef = doc(firestore, "loanRequests", id)
      await updateDoc(requestRef, { status })

      const requestSnap = await getDoc(requestRef)
      const request = requestSnap.data()

      // Add borrower notification
      await addDoc(collection(firestore, "notifications"), {
        userId: request.borrowerId,
        type: "loan_status_update",
        status,
        message: `Your loan request has been ${status}.`,
        requestId: id,
        createdAt: serverTimestamp(),
      })

      toast.success(`Loan request ${status}`)

      // Update local state
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      )
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update loan request")
    }
  }

  if (loading) {
    return (
      <DashboardWrapper>
        <div className="text-white">Loading requests...</div>
      </DashboardWrapper>
    )
  }

  return (
    <DashboardWrapper>
      <h1 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Pending Loan Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-gray-400">No requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-gray-900 p-5 border border-gray-700 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <User className="w-5 h-5 text-blue-400" />
                  {req.borrowerName || "Borrower"}
                </div>
                {req.reason && (
                  <p className="text-sm text-gray-400">Reason: {req.reason}</p>
                )}
                <p className="text-sm text-gray-400">
                  Amount: ₹{req.amount} | Interest: {req.interestRate || 0}%
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  Trust Score: <span className="text-green-400">{req.trustScore || "N/A"}</span>
                </p>
                <p className="text-sm mt-1">
                  Status:{" "}
                  <span
                    className={`${
                      req.status === "approved"
                        ? "text-green-400"
                        : req.status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {req.status}
                  </span>
                </p>
              </div>

              {req.status === "pending" && (
                <div className="flex flex-wrap gap-4 mt-4">
                  <button
                    className="bg-green-500 text-white px-3 py-1.5 text-sm rounded hover:bg-green-600 transition w-full sm:w-auto"
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1.5 text-sm rounded hover:bg-red-600 transition w-full sm:w-auto"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardWrapper>
  )
}
