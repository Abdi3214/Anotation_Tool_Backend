"use client";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../../../context/UserContext";
const Annotation = () => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("annotationIndex");
      return saved !== null ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sourceSelections, setSourceSelections] = useState([]);
  const [targetSelections, setTargetSelections] = useState([]);
  const [targetCategory, setTargetCategory] = useState("Addition");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMistranslation, setCurrentMistranslation] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const sliderRef = useRef(null);
  const sourceRef = useRef(null);
  const targetRef = useRef(null);
  // default rating (used for SSR and initial CSR)
  const [rating, setRating] = useState(50);
  // track hydration
  const [mounted, setMounted] = useState(false);

  const progress = Math.round(((currentIndex + 1) / items.length) * 100);
  // toggle to show tagged output container
  const [showTagged, setShowTagged] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedSourceText, setSelectedSourceText] = useState("");
  const [pendingTargetText, setPendingTargetText] = useState("");
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({
    top: 0,
    left: 0,
  });
  const { user } = useStore();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
    }
  }, []);
  

  const [savedIndices, setSavedIndices] = useState([]);
  // useEffect(() => {
  //   fetchSaved();
  // }, []);
  // const fetchSaved = async () => {
  //   try {
  //     const res = await fetch(
  //       "http://localhost:5000/api/annotation/Addannotation"
  //     );
  //     const saved = await res.json();
  //     // assume each saved annotation has an Annotator_ID field
  //     setSavedIndices(saved.map((a) => a.Annotator_ID));
  //   } catch (e) {
  //     console.error("Failed to load saved annotations:", e);
  //   }
  // };

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/annotation/Allannotation", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const saved = await res.json();
        const savedIdxs = saved
          .map(a =>
            items.findIndex(item => item.sourceText === a.Src_Text)
          )
          .filter(idx => idx >= 0);
        setSavedIndices(savedIdxs);
      } catch (e) {
        console.error("Failed to load saved annotations:", e);
      }
    };
  
    if (items.length > 0) fetchSaved();
  }, [items]);
  

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/data/annotation");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        const mapped = data.map((post) => ({
          id: post.id,
          sourceText: post.english,
          targetText: post.somali,
        }));
        setItems(mapped);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);
  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/api/progress", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.index !== undefined && !isNaN(data.index)) {
          setCurrentIndex(data.index);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      }
    };
  
    if (items.length > 0) {
      fetchProgress();
    }
  }, [items]);
  
  // localStorage.setItem('totalAnnotations', items.length);
  // only write to localStorage once items have been fetched/updated
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("totalAnnotations", items.length.toString());
    }
  }, [items]);
  // 2) Reset selections whenever currentIndex changes
  useEffect(() => {
    setSourceSelections([]);
    setTargetSelections([]);
  }, [currentIndex]);

  // 3) on mount, load stored rating and mark mounted
  useEffect(() => {
    const saved = localStorage.getItem("meaningRating");
    if (saved !== null) {
      setRating(parseInt(saved, 10));
    }
    setMounted(true);
  }, []);

  
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("meaningRating", rating.toString());
    }
  }, [rating, mounted]);

  
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("annotationIndex", currentIndex.toString());
    }
  }, [currentIndex]);
  const getNextMissing = (savedArr, totalItems) => {
    const all = Array.from({ length: totalItems }, (_, i) => i);
    const missing = all.filter((i) => !savedArr.includes(i));
    return missing.length > 0 ? missing[0] : null;
  };
  const handleSave = async () => {
    if (submitting) return;
    setSubmitting(true);
  
    // 1) Prepare counts & payload
    const counts = countAnnotations();
    const payload = {
      Comment: comment,
      Src_Text: sourceText,
      Target_Text: targetText,
      Score: rating,
      Omission: counts.Omission,
      Addition: counts.Addition,
      Mistranslation: counts.Mistranslation,
      Untranslation: counts.Untranslation,
      Src_Issue: getTaggedText(sourceText, sourceSelections),
      Target_Issue: getTaggedText(targetText, targetSelections),
    };
  
    try {
      const token = localStorage.getItem("token");
  
      // 2) Save annotation to backend
      const res = await fetch("http://localhost:5000/api/annotation/Addannotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 409) {
          alert("An annotation already exists for this input. Please modify it.");
        } else {
          console.error(`Save failed: ${res.status} ${res.statusText} - ${text}`);
          alert("Failed to save annotation. Please try again.");
        }
        return;
      }
      await res.json();
  
      // 3) Clear UI state
      clearSelections();
  
      // 4) Build the new savedIndices array synchronously
      const newSaved = [...savedIndices, currentIndex];
      setSavedIndices(newSaved);
  
      // 5) Compute the next index from newSaved
      const next = getNextMissing(newSaved, items.length);
  
      // 6) Advance or finish
      if (next !== null) {
        setCurrentIndex(next);
  
        // 7) Persist progress to backend
        await fetch("http://localhost:5000/api/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ index: next }),
        });
      } else {
        alert("🎉 You've completed all annotations!");
      }
  
      // 8) Cleanup
      setComment("");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded-md skeleton mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-md skeleton mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-md skeleton mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-md skeleton"></div>
        </div>
      </div>
    );
  }
  if (error) return <p>Error loading items: {error.message}</p>;
  if (!items.length) return <p>No items to annotate.</p>;

  const { id, sourceText, targetText } = items[currentIndex];
  const countAnnotations = () => {
    const counts = {
      Omission: sourceSelections.filter(
        (s) => !s.category || s.category === "Omission"
      ).length,
      Addition: targetSelections.filter((s) => s.category === "Addition")
        .length,
      Untranslation: targetSelections.filter(
        (s) => s.category === "Untranslation"
      ).length,
      Mistranslation: targetSelections.filter(
        (s) => s.category === "Mistranslation"
      ).length,
    };
    return counts;
  };
  const getTaggedText = (txt, sels) => {
    if (!sels.length) return txt;
    let out = "",
      idx = 0;
    const tagMap = {
      Addition: "a",
      Untranslation: "u",
      Mistranslation: "m",
      Omission: "o",
    };
    sels.forEach((s) => {
      const i = txt.indexOf(s.text, idx);
      if (i === -1) return;
      out +=
        txt.slice(idx, i) +
        `<${tagMap[s.category || "Omission"]}>${s.text}</${
          tagMap[s.category || "Omission"]
        }>`;
      idx = i + s.text.length;
    });
    out += txt.slice(idx);
    return out;
  };

  const handleChange = (e) => setRating(parseInt(e.target.value, 10));
  const clearSelections = () => {
    setSourceSelections([]);
    setTargetSelections([]);
  };
  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };
  

  function getAbsoluteOffset(container, node, offset) {
    const range = document.createRange();
    range.selectNodeContents(container);
    range.setEnd(node, offset);
    return range.toString().length;
  }


  
  
  
  
  
  

  
  const resetModal = () => {
    setIsModalOpen(false);
    setCurrentMistranslation(null);
    setPendingTargetText("");
    setShowCategoryOptions(false);
  };
  
  
  // const handleSelection = (setSelections, text, category = null, ref = null) => {
  //   try {
  //     const selection = window.getSelection();
  //     if (!selection || selection.rangeCount === 0) return;
  
  //     const selectedText = selection.toString().trim();
  //     if (!selectedText || !ref?.current?.textContent?.includes(selectedText)) {
  //       selection.removeAllRanges();
  //       return;
  //     }
  
  //     const range = selection.getRangeAt(0);
  //     const preRange = document.createRange();
  //     preRange.selectNodeContents(ref.current);
  //     preRange.setEnd(range.startContainer, range.startOffset);
  //     const start = preRange.toString().length;
  //     const end = start + selectedText.length;
  
  //     if (start === -1 || end > text.length) {
  //       selection.removeAllRanges();
  //       return;
  //     }
  
  //     if (setSelections === setTargetSelections) {
  //       setPendingTargetText(selectedText);
  //       setShowCategoryOptions(true);
  //       const rect = range.getBoundingClientRect();
  //       setSelectionPosition({
  //         top: rect.bottom + window.scrollY + 10,
  //         left: rect.left + window.scrollX,
  //       });
  //       selection.removeAllRanges();
  //       return;
  //     }
  
  //     setSelections((prev) => {
  //       // 🟢 Deselect Mistranslation in source and remove from target
  //       const isMistranslation = category === "Mistranslation";
  //       const matchIndex = prev.findIndex(
  //         (s) =>
  //           s.start === start &&
  //           s.end === end &&
  //           s.text === selectedText &&
  //           s.category === category
  //       );
  
  //       if (matchIndex !== -1) {
  //         // If Mistranslation, remove its linked target as well
  //         if (isMistranslation) {
  //           const linkedTargetText = prev[matchIndex].linkedTargetText;
  //           setTargetSelections((targetPrev) =>
  //             targetPrev.filter(
  //               (t) => t.text !== linkedTargetText || t.category !== "Mistranslation"
  //             )
  //           );
  //         }
  
  //         // Deselect source
  //         return prev.filter((_, i) => i !== matchIndex);
  //       }
  
  //       const overlaps = prev.some(({ start: sStart, end: sEnd }) => {
  //         return start < sEnd && end > sStart;
  //       });
  
  //       if (overlaps) {
  //         return prev;
  //       }
  
  //       return [...prev, { text: selectedText, category, start, end }];
  //     });
  
  //     selection.removeAllRanges();
  //   } catch (err) {
  //     console.error("Error during text selection:", err);
  //     window.getSelection()?.removeAllRanges();
  //   }
  // };
  
  const handleSelection = (setSelections, text, category = null, ref = null) => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
  
      const selectedText = selection.toString().trim();
      if (!selectedText || !ref?.current?.textContent?.includes(selectedText)) {
        selection.removeAllRanges();
        return;
      }
  
      const range = selection.getRangeAt(0);
      const preRange = document.createRange();
      preRange.selectNodeContents(ref.current);
      preRange.setEnd(range.startContainer, range.startOffset);
      const start = preRange.toString().length;
      const end = start + selectedText.length;
  
      if (start === -1 || end > text.length) {
        selection.removeAllRanges();
        return;
      }
  
      if (setSelections === setTargetSelections) {
        setPendingTargetText(selectedText);
        setShowCategoryOptions(true);
        const rect = range.getBoundingClientRect();
        setSelectionPosition({
          top: rect.bottom + window.scrollY + 10,
          left: rect.left + window.scrollX,
        });
        selection.removeAllRanges();
        return;
      }
  
      setSelections((prev) => {
        // 🟢 Deselect Mistranslation in source and remove from target
        const isMistranslation = category === "Mistranslation";
        const matchIndex = prev.findIndex(
          (s) =>
            s.start === start &&
            s.end === end &&
            s.text === selectedText &&
            s.category === category
        );
  
        if (matchIndex !== -1) {
          // If Mistranslation, remove its linked target as well
          if (isMistranslation) {
            const linkedTargetText = prev[matchIndex].linkedTargetText;
            setTargetSelections((targetPrev) =>
              targetPrev.filter(
                (t) => t.text !== linkedTargetText || t.category !== "Mistranslation"
              )
            );
          }
  
          // Deselect source
          return prev.filter((_, i) => i !== matchIndex);
        }
  
        const overlaps = prev.some(({ start: sStart, end: sEnd }) => {
          return start < sEnd && end > sStart;
        });
  
        if (overlaps) {
          return prev;
        }
  
        return [...prev, { text: selectedText, category, start, end }];
      });
  
      selection.removeAllRanges();
    } catch (err) {
      console.error("Error during text selection:", err);
      window.getSelection()?.removeAllRanges();
    }
  };
  
      
  
  
  const handleCategoryConfirm = (cat) => {
    if (!pendingTargetText) return;
  
    const start = targetText.indexOf(pendingTargetText);
    const end = start + pendingTargetText.length;
  
    const overlaps = targetSelections.some(({ text, start: sStart, end: sEnd }) => {
      return text !== pendingTargetText && !(end <= sStart || start >= sEnd);
    });
  
    if (overlaps) {
      alert(`"${pendingTargetText}" overlaps with another selection.`);
      setPendingTargetText("");
      setShowCategoryOptions(false);
      return;
    }
  
    const existingIndex = targetSelections.findIndex(s => s.text === pendingTargetText);
    if (existingIndex !== -1) {
      const existing = targetSelections[existingIndex];
      if (existing.category === cat) {
        setTargetSelections(prev => prev.filter((_, i) => i !== existingIndex));
      } else if (cat === "Mistranslation") {
        setTargetSelections(prev => prev.filter((_, i) => i !== existingIndex));
        setIsModalOpen(true);
        setCurrentMistranslation({ text: pendingTargetText, category: "Mistranslation", start, end });
      } else {
        const updated = [...targetSelections];
        updated[existingIndex] = { text: pendingTargetText, category: cat, start, end };
        setTargetSelections(updated);
      }
    } else {
      if (cat === "Mistranslation") {
        setIsModalOpen(true);
        setCurrentMistranslation({ text: pendingTargetText, category: "Mistranslation", start, end });
      } else {
        setTargetSelections(prev => [
          ...prev,
          { text: pendingTargetText, category: cat, start, end }
        ]);
      }
    }
  
    setPendingTargetText("");
    setShowCategoryOptions(false);
  };
  
  const handleSourceSelection = () => {
    const selection = window.getSelection();
    const selectionText = selection.toString().trim();
  
    if (
      selectionText &&
      sourceText.includes(selectionText) &&
      currentMistranslation
    ) {
      const start = sourceText.indexOf(selectionText);
      const end = start + selectionText.length;
  
      // 🔁 Deselect if Mistranslation already exists
      const existingIndex = sourceSelections.findIndex(
        (s) =>
          s.category === "Mistranslation" &&
          s.start === start &&
          s.end === end &&
          s.text === selectionText
      );
  
      if (existingIndex !== -1) {
        const linkedTarget = sourceSelections[existingIndex].linkedTargetText;
        setSourceSelections((prev) =>
          prev.filter((_, i) => i !== existingIndex)
        );
        setTargetSelections((prev) =>
          prev.filter(
            (t) =>
              !(t.text === linkedTarget && t.category === "Mistranslation")
          )
        );
        resetModal();
        return;
      }
  
      // ❌ Remove overlapping Omission
      setSourceSelections((prev) =>
        prev.filter(
          (s) =>
            !(
              s.category === "Omission" &&
              !(end <= s.start || start >= s.end)
            )
        )
      );
  
      // ❌ Remove any overlapping Mistranslation in source (for update case)
      setSourceSelections((prev) =>
        prev.filter(
          (s) =>
            !(
              s.category === "Mistranslation" &&
              !(end <= s.start || start >= s.end)
            )
        )
      );
  
      // ✅ Remove related target Mistranslation if present
      setTargetSelections((prev) =>
        prev.filter(
          (t) =>
            !(
              t.category === "Mistranslation" &&
              (t.text === currentMistranslation.text ||
                t.linkedSourceText === selectionText)
            )
        )
      );
  
      // ❌ Prevent duplicate target side
      const targetAlreadyLinked = targetSelections.some(
        (t) =>
          t.category === "Mistranslation" &&
          (t.text === currentMistranslation.text ||
            t.text.includes(currentMistranslation.text) ||
            currentMistranslation.text.includes(t.text))
      );
  
      if (targetAlreadyLinked) {
        alert("This Mistranslation pair overlaps with an existing one.");
        resetModal();
        return;
      }
  
      // ✅ Add new Mistranslation pair
      setSourceSelections((prev) => [
        ...prev,
        {
          text: selectionText,
          category: "Mistranslation",
          linkedTargetText: currentMistranslation.text,
          start,
          end,
        },
      ]);
  
      setTargetSelections((prev) => [
        ...prev,
        {
          text: currentMistranslation.text,
          category: "Mistranslation",
          linkedSourceText: selectionText,
          start: currentMistranslation.start,
          end: currentMistranslation.end,
        },
      ]);
  
      resetModal();
    }
  
    selection.removeAllRanges();
  };


const getClassAndTooltip = (sel) => {
  if (!sel.category) {
    return { colorClass: "bg-blue-100 text-blue-800 font-semibold px-1 rounded", tooltipText: "Omission" };
  }

  switch (sel.category) {
    case "Addition":
      return {
        colorClass: "bg-red-100 text-red-800 font-semibold px-1 rounded",
        tooltipText: "Addition",
      };
    case "Untranslation":
      return {
        colorClass: "bg-yellow-100 text-yellow-900 font-semibold px-1 rounded",
        tooltipText: "Untranslation",
      };
    case "Mistranslation":
      return {
        colorClass: "bg-green-100 text-green-800 font-semibold px-1 rounded",
        tooltipText: "Mistranslation",
      };
    default:
      return {
        colorClass: "bg-yellow-100 text-gray-700 font-semibold px-1 rounded",
        tooltipText: sel.category,
      };
  }
};

  const renderText = (text, selections) => {
    if (!selections.length) return text;
  
    // 1. Map & sort
    const sorted = selections
      .map(sel => ({
        ...sel,
        start: text.indexOf(sel.text),
        ...getClassAndTooltip(sel)
      }))
      .filter(s => s.start !== -1)
      .sort((a, b) => a.start - b.start);
  
    // 2. Build your pieces
    const parts = [];
    let lastIndex = 0;
    sorted.forEach((s, i) => {
      if (s.start > lastIndex) {
        parts.push(<span key={`n-${i}`}>{text.slice(lastIndex, s.start)}</span>);
      }
      parts.push(
        <span
          key={`h-${i}`}
          className={`${s.colorClass} font-semibold tooltip tooltip-open tooltip-top`}
          data-tip={s.tooltipText}
        >
          {s.text}
        </span>
      );
      lastIndex = s.start + s.text.length;
    });
    if (lastIndex < text.length) {
      parts.push(<span key="last">{text.slice(lastIndex)}</span>);
    }
    return parts;
  };
  
  const renderTaggedText = (txt, sels) => {
    if (!sels.length) return txt;
    let out = "",
      idx = 0;
    const tagMap = {
      Addition: "a",
      Untranslation: "u",
      Mistranslation: "m",
      Omission: "o",
    };
    sels.forEach((s) => {
      const i = txt.indexOf(s.text, idx);
      if (i === -1) return;
      out +=
        txt.slice(idx, i) +
        `<${tagMap[s.category || "Omission"]}>${s.text}</${
          tagMap[s.category || "Omission"]
        }>`;
      idx = i + s.text.length;
    });
    out += txt.slice(idx);
    return <span className="font-mono whitespace-pre-wrap">{out}</span>;
  };

  return (
    <>
      <div className="w-full container rounded mx-auto flex dark:bg-[#0a0a0a]">
        <div className="flex-1 flex flex-col space-y-5">
          {/* Header */}
          <div className="border-b border-gray-200 h-16 flex items-center justify-between px-3">
            <div className="flex items-center space-x-2">
              <p>
                Text ID: <span>{currentIndex + 1}</span>
              </p>
              <progress
                className="progress progress-info w-56"
                value={progress}
                max="100"
              />
            </div>
          </div>

          {/* Prompt */}
          <div className="text-center text-3xl font-semibold p-2">
            Does the lower text adequately express the meaning of the upper
            text?
          </div>

          {/* Source & Target */}
          <div className="p-3">
            <div className="border border-gray-200 rounded-sm shadow-sm p-2 space-y-8">
              <p 
                onMouseUp={() =>
                  handleSelection(setSourceSelections,  sourceText, "Omission", sourceRef)
                }
              >
                <span className="text-2xl font-semibold">Source Text:</span>{" "}
                <span ref={sourceRef}>{renderText(sourceText, sourceSelections)}</span>
              </p>

              {showCategoryOptions && (
                <div
                  className="absolute bg-white border rounded shadow p-2 space-y-2 z-50"
                  style={{
                    top: `${selectionPosition.top}px`,
                    left: `${selectionPosition.left}px`,
                  }}
                >
                  <p className="text-sm font-semibold">Choose category:</p>
                  <label className="flex items-center space-x-1">
                    <input
                      type="radio"
                      name="category"
                      onChange={() => handleCategoryConfirm("Addition")}
                    />
                    <span>Addition</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input
                      type="radio"
                      name="category"
                      onChange={() => handleCategoryConfirm("Untranslation")}
                    />
                    <span>Untranslation</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input
                      type="radio"
                      name="category"
                      onChange={() => handleCategoryConfirm("Mistranslation")}
                    />
                    <span>Mistranslation</span>
                  </label>
                </div>
              )}

              <p
                onMouseUp={() =>
                  handleSelection(
                    setTargetSelections,
                    targetText,
                    targetCategory,
                    targetRef
                  )
                }
              >
                <span className="text-2xl font-semibold">Target Text:</span>{" "}
                <span ref={targetRef}>{renderText(targetText, targetSelections)}</span>
              </p>
            </div>
            <div className="flex justify-center mt-6"></div>
          </div>
          {/* Mistranslation Modal */}
          {isModalOpen && (
            <div
              className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="bg-white p-6 rounded shadow-lg max-w-xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Select Mistranslation text from Source Text
                </h2>
                <div
                  className="border p-4 rounded select-text"
                  onMouseUp={handleSourceSelection}
                >
                  {renderText(sourceText, sourceSelections)}
                </div>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <p className="text-lg font-semibold ml-3 mt-4">Selected value: {rating}</p>

          {/* Meaning Slider */}
          <div className="p-6 container mx-auto">
            <div className="flex space-x-4 font-semibold mb-1 px-1">
              <span>strongly disagree</span>
              <div className="relative w-full">
                <input
                  ref={sliderRef}
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={rating}
                  onChange={handleChange}
                  className="range range-primary w-full"
                />
                <div className="absolute left-0 right-0 top-6 flex justify-between text-xs text-gray-300 px-1">
                  <span
                    className="tooltip tooltip-open tooltip-bottom"
                    data-tip="Nonsense/No meaning preserved"
                  />
                  <span
                    className="tooltip tooltip-open tooltip-bottom"
                    data-tip="Some meaning preserved"
                  />
                  <span
                    className="tooltip tooltip-open tooltip-bottom"
                    data-tip="Most meaning preserved"
                  />
                  <span
                    className="tooltip tooltip-open tooltip-bottom"
                    data-tip="Perfect meaning"
                  />
                </div>
              </div>
              <span>strongly agree</span>
            </div>
            
          </div>
          {/* Comments & Submit */}
          <textarea
          value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
            className="border border-gray-200 focus:ouline-1 focus:outline-gray-500 shadow rounded p-2 mx-3 mb-3"
            placeholder="Please write any comment about the highlighted errors or annotation"
          />
          <div className="flex justify-center">
            <button onClick={handleSave} className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
          {/* MQM Guidelines */}
          <div className="border-t border-b mx-3">
            <button
              onClick={() => toggleSection("mqm")}
              className="w-full flex items-center justify-between py-3"
            >
              <span className="text-lg font-medium flex items-center">
                MQM Guidelines{" "}
                <ChevronDown
                  className={`${openSection === "mqm" ? "rotate-180" : ""}`}
                  size={20}
                />
              </span>
            </button>
            {openSection === "mqm" && (
              <div className="px-4 pb-4 space-y-3">
                <p className="font-semibold text-center">Source text</p>
                <p>
                  <strong>Omission:</strong> The highlighted span in the
                  translation corresponds to information that{" "}
                  <strong>does not exist </strong>in the translated text.
                </p>
                <p>
                  <strong>Mistranslation:</strong> The highlighted span in the
                  source<strong> does not have the exact same meaning</strong>{" "}
                  as the highlighted span in the translation segmen
                </p>
                <p className="font-semibold text-center">Target text</p>
                <p>
                  <strong>Addition:</strong> The highlighted span corresponds to
                  information that<strong> does not exist</strong> in the other
                  segment.
                </p>
                <p>
                  <strong>Mistranslation:</strong> The highlighted span in the
                  source<strong> does not have the exact same meaning</strong>{" "}
                  as the highlighted span in the translation segmen
                </p>
                <p>
                  <strong>Untranslated:</strong> The highlighted span in the
                  translation is a <strong>copy</strong> of the highlighted span
                  in the source segment.
                </p>
              </div>
            )}
          </div>

          {/* DA Guidelines */}
          <div className="border-t border-b m-3">
            <button
              onClick={() => toggleSection("da")}
              className="w-full flex items-center justify-between py-3"
            >
              <span className="text-lg font-medium flex items-center">
                DA Guidelines{" "}
                <ChevronDown
                  className={`${openSection === "da" ? "rotate-180" : ""}`}
                  size={20}
                />
              </span>
            </button>
            {openSection === "da" && (
              <div className="px-4 pb-4 space-y-3">
                <p>
                  <strong>Nonsense/No meaning preserved:</strong> Nearly all
                  information is lost between the translation and source.
                </p>
                <p>
                  <strong>Some meaning preserved:</strong> The translation
                  preserves some of the meaning of the source but misses
                  significant parts.
                </p>
                <p>
                  <strong>Most meaning preserved:</strong> The translation
                  preserves some of the meaning of the source but misses
                  significant parts.
                </p>
                <p>
                  <strong>Perfect meaning:</strong> The translation preserves
                  some of the meaning of the source but misses significant
                  parts.
                </p>
              </div>
            )}
          </div>

          <p className="mb-6 text-center">
            Texts left to be annotated: {items.length - currentIndex}
          </p>
        </div>
      </div>
    </>
  );
};

export default Annotation;
