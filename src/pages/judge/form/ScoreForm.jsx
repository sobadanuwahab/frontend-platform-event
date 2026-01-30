import { useState, useEffect, useCallback } from "react";
import {
  Save,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Folder,
  LayoutGrid,
  Users,
  Calendar,
} from "lucide-react";
import api from "../../../services/api";

// Helper function to get quality label based on value
const getQualityLabel = (value, max) => {
  const percentage = (value / max) * 100;
  if (percentage <= 40) return { label: "Kurang", color: "red" };
  if (percentage <= 60) return { label: "Cukup", color: "yellow" };
  if (percentage <= 80) return { label: "Baik", color: "blue" };
  return { label: "Baik Sekali", color: "green" };
};

// Fungsi untuk mengkonversi format aspect_score ke format values yang diharapkan dengan mapping yang benar
const convertAspectScoreToValues = (aspectScore, maxScore) => {
  const values = {};

  // Mapping: poor -> Kurang
  if (aspectScore.poor && Array.isArray(aspectScore.poor)) {
    aspectScore.poor.forEach((score) => {
      const label = `Kurang (${score})`;
      values[label] = score;
    });
  }

  // Mapping: fair -> Cukup
  if (aspectScore.fair && Array.isArray(aspectScore.fair)) {
    aspectScore.fair.forEach((score) => {
      const label = `Cukup (${score})`;
      values[label] = score;
    });
  }

  // Mapping: good -> Baik
  if (aspectScore.good && Array.isArray(aspectScore.good)) {
    aspectScore.good.forEach((score) => {
      const label = `Baik (${score})`;
      values[label] = score;
    });
  }

  // Mapping: excellent -> Baik Sekali
  if (aspectScore.excellent && Array.isArray(aspectScore.excellent)) {
    aspectScore.excellent.forEach((score) => {
      const label = `Baik Sekali (${score})`;
      values[label] = score;
    });
  }

  return values;
};

// Fungsi untuk mendapatkan nilai tengah berdasarkan kualitas dengan mapping yang benar
const getMidValueForQuality = (aspectScore, quality) => {
  let values = [];

  // Mapping kualitas: poor=kurang, fair=cukup, good=baik, excellent=baikSekali
  switch (quality) {
    case "kurang":
      values = aspectScore.poor || [];
      break;
    case "cukup":
      values = aspectScore.fair || [];
      break;
    case "baik":
      values = aspectScore.good || [];
      break;
    case "baikSekali":
      values = aspectScore.excellent || [];
      break;
  }

  if (values.length === 0) return 0;

  // Ambil nilai tengah
  const sortedValues = values.sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);
  return sortedValues[middleIndex];
};

const ScoreForm = ({ userData = null }) => {
  const [scores, setScores] = useState({});
  const [teamName, setTeamName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [forms, setForms] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);
  const [activeFormId, setActiveFormId] = useState(1);
  const [rawFormData, setRawFormData] = useState(null);
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [participantError, setParticipantError] = useState("");

  // Daftar form statis
  useEffect(() => {
    setForms([
      {
        id: 1,
        name: "FORM PENILAIAN PBB",
        description: "Form penilaian Peraturan Baris Berbaris",
      },
    ]);
  }, []);

  // Fetch events dari /list-all-event
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        console.log("Mengambil daftar event dari /list-all-event");
        const response = await api.get("/list-all-event");

        if (response.data.success) {
          const eventsData = response.data.data;
          console.log("Data event yang diterima:", eventsData);
          setEvents(eventsData);

          // Set eventId ke event pertama jika ada
          if (eventsData.length > 0) {
            const firstEvent = eventsData[0];
            setEventId(firstEvent.id.toString());
            console.log(
              `Event pertama dipilih: ${firstEvent.name} (ID: ${firstEvent.id})`,
            );
          }
        } else {
          throw new Error(response.data.message || "Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([
          { id: 1, name: "Event Paskibra SMAN 1 Cilegon" },
          { id: 2, name: "Event Paskibra Lainnya" },
          { id: 3, name: "Event Baru" },
        ]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch semua participants (semua event) - hanya sekali saat mount
  useEffect(() => {
    const fetchAllParticipants = async () => {
      try {
        setLoadingParticipants(true);
        console.log("Mengambil semua peserta dari database...");

        // Coba endpoint yang mungkin ada:
        // 1. Coba endpoint umum dulu
        let response;
        try {
          response = await api.get("/participant-lists");
          console.log("Menggunakan endpoint /participant-lists");
        } catch (err) {
          console.log(
            "Endpoint /participant-lists gagal, coba /participant-lists/1",
          );
          response = await api.get("/participant-lists/1");
        }

        if (response.data.success) {
          const participantsData = response.data.data;
          console.log("Semua data peserta yang diterima:", participantsData);
          console.log("Total peserta di database:", participantsData.length);

          // Debug: Tampilkan event ID untuk setiap participant
          participantsData.forEach((p, i) => {
            console.log(
              `Participant ${i + 1}: ${p.school_name} - Event ID: ${p.event?.id || "tidak ada"}`,
            );
          });

          setAllParticipants(participantsData);
          setParticipantError("");
        } else {
          throw new Error(
            response.data.message || "Failed to fetch participants",
          );
        }
      } catch (error) {
        console.error("Error fetching all participants:", error);
        setParticipantError("Gagal mengambil data peserta dari server");

        // Fallback data untuk development
        const fallbackParticipants = [
          {
            id: 1,
            school_name: "SMAN 3 Cilegon",
            name: "SMAN 3 Cilegon",
            school_address: "Cilegon Mancak, Banten",
            coach: "Udin Coach",
            event: { id: 1, name: "Event Paskibra SMAN 1 Cilegon" },
            participant_category: { id: 3, name: "SMA" },
          },
          {
            id: 2,
            school_name: "SMAN 7 Serang",
            name: "SMAN 7 Serang",
            school_address: "Sebelah Mall of Serang, Banten",
            coach: "Udin Coach",
            event: { id: 1, name: "Event Paskibra SMAN 1 Cilegon" },
            participant_category: { id: 3, name: "SMA" },
          },
          {
            id: 3,
            school_name: "SMAN 99 Pandeglang",
            name: "SMAN 99 Pandeglang",
            school_address: "Pandeglang deket martabak mang Udin, Banten",
            coach: "Udin Coach",
            event: { id: 1, name: "Event Paskibra SMAN 1 Cilegon" },
            participant_category: { id: 3, name: "SMA" },
          },
          {
            id: 4,
            school_name: "SMA Buaran Serpong",
            name: "SMA Buaran Serpong",
            school_address: "Serpong Timur",
            coach: "Surya",
            event: { id: 2, name: "Event Paskibra Lainnya" },
            participant_category: { id: 3, name: "SMA" },
          },
          {
            id: 5,
            school_name: "SMA Cilegon Barat",
            name: "SMA Cilegon Barat",
            school_address: "Cilegon Barat",
            coach: "Budi",
            event: { id: 3, name: "Event Baru" },
            participant_category: { id: 3, name: "SMA" },
          },
        ];
        setAllParticipants(fallbackParticipants);
      } finally {
        setLoadingParticipants(false);
      }
    };

    fetchAllParticipants();
  }, []);

  // Filter participants berdasarkan event_id yang dipilih
  useEffect(() => {
    const filterParticipants = () => {
      if (!eventId || allParticipants.length === 0) {
        console.log("Event ID tidak ada atau tidak ada peserta");
        setFilteredParticipants([]);
        return;
      }

      console.log(`Memfilter peserta untuk event_id: ${eventId}`);

      // Filter participants berdasarkan event.id
      const filtered = allParticipants.filter((participant) => {
        // Pastikan participant memiliki event object
        if (!participant.event) {
          console.log(
            `Participant ${participant.id} tidak memiliki event object`,
          );
          return false;
        }

        const participantEventId = participant.event.id?.toString();
        const matches = participantEventId === eventId.toString();

        console.log(
          `Participant ${participant.id}: ${participant.school_name} - Event ID: ${participantEventId}, Target: ${eventId}, Match: ${matches}`,
        );

        return matches;
      });

      console.log(
        `✅ Peserta setelah difilter untuk event ${eventId}:`,
        filtered.length,
        "tim",
      );

      // Tampilkan detail tim yang difilter
      filtered.forEach((team, index) => {
        console.log(`  ${index + 1}. ${team.school_name} (ID: ${team.id})`);
      });

      setFilteredParticipants(filtered);

      // Reset selected team jika team tidak ada di event yang baru
      if (selectedTeamId) {
        const selectedTeamExists = filtered.some(
          (team) => team.id.toString() === selectedTeamId,
        );
        if (!selectedTeamExists) {
          console.log(
            `🔄 Reset selected team karena tidak ada di event ${eventId}`,
          );
          setSelectedTeamId("");
          setTeamName("");
        }
      }
    };

    filterParticipants();
  }, [eventId, allParticipants, selectedTeamId]);

  // Fetch form data
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Mengambil detail form dengan ID: ${activeFormId}`);
        const response = await api.get(`/show-detail-form/${activeFormId}`);

        if (response.data.success) {
          const apiData = response.data.data;
          console.log("Detail form yang diterima:", apiData);
          setRawFormData(apiData);

          const transformedFormData = {
            id: apiData.id,
            name: apiData.name,
            description: "Form penilaian Peraturan Baris Berbaris",
            categories:
              apiData.categories?.map((category) => {
                const categoryAspect = category.category_aspects?.[0];

                return {
                  category: category.name,
                  items:
                    categoryAspect?.aspects?.map((aspect) => ({
                      id: `aspect_${aspect.id}`,
                      label: aspect.name,
                      max: aspect.max_score,
                      values: convertAspectScoreToValues(
                        aspect.aspect_score,
                        aspect.max_score,
                      ),
                      rawAspect: aspect,
                    })) || [],
                };
              }) || [],
          };

          setFormData(transformedFormData);

          // Load saved scores
          const savedDataKey = userData
            ? `form_scores_${userData.id}_${activeFormId}_${eventId}`
            : `form_scores_${activeFormId}_${eventId}`;

          const savedData = localStorage.getItem(savedDataKey);
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              setScores(parsedData.scores || {});
              setTeamName(parsedData.teamName || "");
              setSelectedTeamId(parsedData.selectedTeamId || "");
            } catch (err) {
              console.error("Error parsing saved data:", err);
            }
          } else {
            setScores({});
            setTeamName("");
            setSelectedTeamId("");
          }
        } else {
          throw new Error(response.data.message || "Failed to fetch form data");
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        setError(`Gagal mengambil detail form: ${error.message}`);
        setFormData(null);

        // Fallback data statis
        setFormData({
          id: 1,
          name: "FORM PENILAIAN PBB",
          description: "Form penilaian Peraturan Baris Berbaris",
          categories: [
            {
              category: "GERAKAN TAMBAHAN",
              items: [
                {
                  id: "aspect_1",
                  label: "Bersaf Kumpul",
                  max: 35,
                  values: {
                    "Kurang (1)": 1,
                    "Kurang (2)": 2,
                    "Kurang (4)": 4,
                    "Cukup (6)": 6,
                    "Cukup (8)": 8,
                    "Cukup (12)": 12,
                    "Baik (15)": 15,
                    "Baik (19)": 19,
                    "Baik (23)": 23,
                    "Baik Sekali (29)": 29,
                    "Baik Sekali (35)": 35,
                  },
                },
              ],
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [activeFormId, userData, eventId]);

  // Save to localStorage
  const saveToStorage = (newScores, additionalData = {}) => {
    if (!activeFormId || !eventId) return;

    const savedDataKey = userData
      ? `form_scores_${userData.id}_${activeFormId}_${eventId}`
      : `form_scores_${activeFormId}_${eventId}`;

    const data = {
      scores: newScores,
      teamName,
      selectedTeamId,
      eventId,
      ...additionalData,
      formId: activeFormId,
      userId: userData?.id,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(savedDataKey, JSON.stringify(data));
  };

  // Handle score change
  const handleScoreChange = (itemId, value) => {
    const newScores = { ...scores, [itemId]: value };
    setScores(newScores);
    saveToStorage(newScores);
  };

  // Handle team selection change
  const handleTeamChange = (e) => {
    const selectedId = e.target.value;
    setSelectedTeamId(selectedId);

    const selectedTeam = filteredParticipants.find(
      (team) => team.id.toString() === selectedId,
    );
    if (selectedTeam) {
      setTeamName(selectedTeam.school_name || selectedTeam.name);
    } else {
      setTeamName("");
    }

    saveToStorage(scores, {
      selectedTeamId: selectedId,
      teamName: selectedTeam?.school_name || selectedTeam?.name || "",
    });
  };

  // Handle event change
  const handleEventChange = (e) => {
    const selectedEventId = e.target.value;
    console.log(`🎯 Event berubah dari ${eventId} ke ${selectedEventId}`);
    setEventId(selectedEventId);

    // Reset selected team dan scores ketika event berubah
    setSelectedTeamId("");
    setTeamName("");
    setScores({});

    // Hapus data localStorage untuk event sebelumnya
    const previousEventId = eventId;
    if (previousEventId && userData && activeFormId) {
      const oldSavedDataKey = userData
        ? `form_scores_${userData.id}_${activeFormId}_${previousEventId}`
        : `form_scores_${activeFormId}_${previousEventId}`;
      localStorage.removeItem(oldSavedDataKey);
    }
  };

  // Toggle expanded category
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Toggle all categories
  const toggleAllCategories = () => {
    if (!formData) return;

    if (allExpanded) {
      setExpandedCategories({});
    } else {
      const allExpandedState = {};
      formData.categories?.forEach((cat) => {
        allExpandedState[cat.category] = true;
      });
      setExpandedCategories(allExpandedState);
    }
    setAllExpanded(!allExpanded);
  };

  // Quick fill category with specific quality
  const quickFillCategory = (category, quality) => {
    if (!formData || !rawFormData) return;

    const categoryIndex = formData.categories?.findIndex(
      (cat) => cat.category === category,
    );
    if (categoryIndex === -1) return;

    const newScores = { ...scores };
    const rawCategory = rawFormData.categories[categoryIndex];
    const categoryAspect = rawCategory.category_aspects?.[0];

    if (!categoryAspect || !categoryAspect.aspects) return;

    categoryAspect.aspects.forEach((aspect) => {
      const itemId = `aspect_${aspect.id}`;
      const targetValue = getMidValueForQuality(aspect.aspect_score, quality);

      if (targetValue > 0) {
        newScores[itemId] = targetValue;
      }
    });

    setScores(newScores);
    saveToStorage(newScores);
  };

  // Quick fill specific item with quality
  const quickFillItem = (itemId, quality, aspectScore) => {
    const targetValue = getMidValueForQuality(aspectScore, quality);
    if (targetValue > 0) {
      handleScoreChange(itemId, targetValue);
    }
  };

  // Get total score for active form
  const getTotalScore = () => {
    if (!formData) return 0;

    let total = 0;
    formData.categories?.forEach((category) => {
      category.items?.forEach((item) => {
        if (scores[item.id]) {
          total += scores[item.id];
        }
      });
    });
    return total;
  };

  // Get max score for active form
  const getTotalMaxScore = () => {
    if (!formData) return 0;

    let total = 0;
    formData.categories?.forEach((category) => {
      category.items?.forEach((item) => {
        total += item.max || 0;
      });
    });
    return total;
  };

  // Get percentage for active form
  const getPercentage = () => {
    const totalMax = getTotalMaxScore();
    const totalScore = getTotalScore();
    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  };

  // Get score by category
  const getCategoryScore = (category) => {
    if (!formData) return 0;

    const categoryData = formData.categories?.find(
      (cat) => cat.category === category,
    );
    if (!categoryData) return 0;

    let total = 0;
    categoryData.items?.forEach((item) => {
      total += scores[item.id] || 0;
    });
    return total;
  };

  // Get max by category
  const getCategoryMax = (category) => {
    if (!formData) return 0;

    const categoryData = formData.categories?.find(
      (cat) => cat.category === category,
    );
    if (!categoryData) return 0;

    let total = 0;
    categoryData.items?.forEach((item) => {
      total += item.max || 0;
    });
    return total;
  };

  // Get average quality for category
  const getCategoryQuality = (category) => {
    const catScore = getCategoryScore(category);
    const catMax = getCategoryMax(category);
    return getQualityLabel(catScore, catMax);
  };

  // Render scoring form based on formData
  const renderScoringForm = () => {
    if (!formData) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm overflow-hidden">
          <div className="p-12 text-center">
            <Folder size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Memuat form penilaian...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
          {formData.description && (
            <div className="text-sm text-gray-600 mt-2">
              {formData.description}
            </div>
          )}
          {userData && (
            <div className="text-sm text-gray-500 mt-1">
              Dinilai oleh: {userData.name}
            </div>
          )}
        </div>

        {/* Categories List */}
        {formData.categories?.map((category, catIndex) => {
          const catScore = getCategoryScore(category.category);
          const catMax = getCategoryMax(category.category);
          const catPercentage =
            catMax > 0 ? Math.round((catScore / catMax) * 100) : 0;
          const catQuality = getCategoryQuality(category.category);
          const isCategoryExpanded =
            expandedCategories[category.category] || false;

          return (
            <div key={catIndex} className="border-b last:border-b-0">
              <div
                onClick={() => toggleCategory(category.category)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex justify-between items-center cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    {isCategoryExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {category.category}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {category.items?.length || 0} item penilaian
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      catQuality.color === "red"
                        ? "bg-red-100 text-red-700"
                        : catQuality.color === "yellow"
                          ? "bg-yellow-100 text-yellow-700"
                          : catQuality.color === "blue"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                    }`}
                  >
                    {catQuality.label}
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {catScore} / {catMax}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        catPercentage >= 80
                          ? "text-green-600"
                          : catPercentage >= 70
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {catPercentage}%
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        quickFillCategory(category.category, "kurang");
                      }}
                      className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium"
                      title="Set semua ke Kurang (poor)"
                    >
                      Kurang
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        quickFillCategory(category.category, "cukup");
                      }}
                      className="px-3 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 font-medium"
                      title="Set semua ke Cukup (fair)"
                    >
                      Cukup
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        quickFillCategory(category.category, "baik");
                      }}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium"
                      title="Set semua ke Baik (good)"
                    >
                      Baik
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        quickFillCategory(category.category, "baikSekali");
                      }}
                      className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 font-medium"
                      title="Set semua ke Baik Sekali (excellent)"
                    >
                      Baik Sekali
                    </button>
                  </div>
                </div>
              </div>

              {isCategoryExpanded && (
                <div className="px-6 pb-6 bg-gray-50">
                  <div className="pt-4">
                    {category.items && category.items.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {category.items.map((item) => renderItem(item))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to render item
  const renderItem = (item) => {
    const currentValue = scores[item.id] || 0;
    const itemMax = item.max || 10;
    const itemQuality = getQualityLabel(currentValue, itemMax);
    const valueEntries = Object.entries(item.values || {});
    const rawAspect = item.rawAspect;

    return (
      <div
        key={item.id}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-medium text-gray-800">{item.label}</h4>
            <div className="text-xs text-gray-500 mt-1">
              Maksimum: {itemMax} poin
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-center px-3 py-1 rounded-lg font-bold ${
                currentValue === 0
                  ? "bg-gray-100 text-gray-700"
                  : itemQuality.color === "red"
                    ? "bg-red-100 text-red-700"
                    : itemQuality.color === "yellow"
                      ? "bg-yellow-100 text-yellow-700"
                      : itemQuality.color === "blue"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
              }`}
            >
              <div className="text-xl">{currentValue}</div>
              <div className="text-xs">poin</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              itemQuality.color === "red"
                ? "bg-red-50 text-red-700"
                : itemQuality.color === "yellow"
                  ? "bg-yellow-50 text-yellow-700"
                  : itemQuality.color === "blue"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-green-50 text-green-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                itemQuality.color === "red"
                  ? "bg-red-500"
                  : itemQuality.color === "yellow"
                    ? "bg-yellow-500"
                    : itemQuality.color === "blue"
                      ? "bg-blue-500"
                      : "bg-green-500"
              }`}
            ></div>
            {itemQuality.label} ({Math.round((currentValue / itemMax) * 100)}%)
          </div>
        </div>

        {rawAspect && rawAspect.aspect_score && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              type="button"
              onClick={() =>
                quickFillItem(item.id, "kurang", rawAspect.aspect_score)
              }
              className="px-2 py-2 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
              title="Nilai tengah dari poor (kurang)"
            >
              Kurang
            </button>
            <button
              type="button"
              onClick={() =>
                quickFillItem(item.id, "cukup", rawAspect.aspect_score)
              }
              className="px-2 py-2 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
              title="Nilai tengah dari fair (cukup)"
            >
              Cukup
            </button>
            <button
              type="button"
              onClick={() =>
                quickFillItem(item.id, "baik", rawAspect.aspect_score)
              }
              className="px-2 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              title="Nilai tengah dari good (baik)"
            >
              Baik
            </button>
            <button
              type="button"
              onClick={() =>
                quickFillItem(item.id, "baikSekali", rawAspect.aspect_score)
              }
              className="px-2 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
              title="Nilai tengah dari excellent (baik sekali)"
            >
              Baik Sekali
            </button>
          </div>
        )}

        {valueEntries.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="space-y-3">
              {valueEntries.filter(([label]) => label.includes("Kurang"))
                .length > 0 && (
                <div>
                  <div className="text-xs font-medium text-red-600 mb-1">
                    Kurang (poor)
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {valueEntries
                      .filter(([label]) => label.includes("Kurang"))
                      .map(([label, value]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleScoreChange(item.id, value)}
                          className={`px-2 py-2 text-sm rounded-lg transition-all ${
                            currentValue === value
                              ? "bg-red-600 text-white ring-2 ring-offset-1 ring-red-300 font-bold"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                          title={label}
                        >
                          {value}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {valueEntries.filter(([label]) => label.includes("Cukup"))
                .length > 0 && (
                <div>
                  <div className="text-xs font-medium text-yellow-600 mb-1">
                    Cukup (fair)
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {valueEntries
                      .filter(([label]) => label.includes("Cukup"))
                      .map(([label, value]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleScoreChange(item.id, value)}
                          className={`px-2 py-2 text-sm rounded-lg transition-all ${
                            currentValue === value
                              ? "bg-yellow-600 text-white ring-2 ring-offset-1 ring-yellow-300 font-bold"
                              : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                          }`}
                          title={label}
                        >
                          {value}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {valueEntries.filter(
                ([label]) =>
                  label.includes("Baik") && !label.includes("Baik Sekali"),
              ).length > 0 && (
                <div>
                  <div className="text-xs font-medium text-blue-600 mb-1">
                    Baik (good)
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {valueEntries
                      .filter(
                        ([label]) =>
                          label.includes("Baik") &&
                          !label.includes("Baik Sekali"),
                      )
                      .map(([label, value]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleScoreChange(item.id, value)}
                          className={`px-2 py-2 text-sm rounded-lg transition-all ${
                            currentValue === value
                              ? "bg-blue-600 text-white ring-2 ring-offset-1 ring-blue-300 font-bold"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          }`}
                          title={label}
                        >
                          {value}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {valueEntries.filter(([label]) => label.includes("Baik Sekali"))
                .length > 0 && (
                <div>
                  <div className="text-xs font-medium text-green-600 mb-1">
                    Baik Sekali (excellent)
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {valueEntries
                      .filter(([label]) => label.includes("Baik Sekali"))
                      .map(([label, value]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleScoreChange(item.id, value)}
                          className={`px-2 py-2 text-sm rounded-lg transition-all ${
                            currentValue === value
                              ? "bg-green-600 text-white ring-2 ring-offset-1 ring-green-300 font-bold"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                          title={label}
                        >
                          {value}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData || !userData.id) {
      alert("Anda harus login sebagai judge untuk menyimpan penilaian!");
      return;
    }

    if (!teamName || !selectedTeamId) {
      alert("Harap pilih tim yang akan dinilai!");
      return;
    }

    if (!eventId) {
      alert("Harap pilih event terlebih dahulu!");
      return;
    }

    const totalScore = getTotalScore();
    const totalMaxScore = getTotalMaxScore();
    const percentage = Math.round((totalScore / totalMaxScore) * 100);

    const selectedTeam = filteredParticipants.find(
      (team) => team.id.toString() === selectedTeamId,
    );

    const selectedEvent = events.find(
      (event) => event.id.toString() === eventId,
    );
    const eventName = selectedEvent?.name || "Event";

    const payload = {
      teamName: selectedTeam?.school_name || teamName,
      teamId: selectedTeamId,
      school_name: selectedTeam?.school_name,
      school_address: selectedTeam?.school_address,
      coach: selectedTeam?.coach,
      event_id: eventId,
      event_name: eventName,
      participant_category_id: selectedTeam?.participant_category?.id,
      scores: Object.entries(scores).map(([itemId, score]) => {
        const aspectId = parseInt(itemId.replace("aspect_", ""));
        return {
          aspect_id: aspectId,
          score: score,
        };
      }),
      formId: activeFormId,
      formName: formData?.name,
      judgeId: userData?.id,
      judgeName: userData?.name,
      totalScore: totalScore,
      percentage: percentage,
      totalMaxScore: totalMaxScore,
      timestamp: new Date().toISOString(),
    };

    console.log("DATA NILAI untuk submit:", payload);

    try {
      const response = await api.post("/submit-scores", payload);
      console.log("Respons dari server:", response.data);

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        const savedDataKey = userData
          ? `form_scores_${userData.id}_${activeFormId}_${eventId}`
          : `form_scores_${activeFormId}_${eventId}`;
        localStorage.removeItem(savedDataKey);

        setScores({});
        setTeamName("");
        setSelectedTeamId("");
      } else {
        alert(
          "Gagal menyimpan data: " + (response.data.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error submitting scores:", error);
      alert("Gagal menyimpan data ke server. Silakan coba lagi.");
    }
  };

  // Handle reset
  const handleReset = () => {
    if (window.confirm("Reset semua nilai untuk form ini?")) {
      setScores({});
      const savedDataKey = userData
        ? `form_scores_${userData.id}_${activeFormId}_${eventId}`
        : `form_scores_${activeFormId}_${eventId}`;
      localStorage.removeItem(savedDataKey);
    }
  };

  // Get participants statistics for debug
  const getParticipantsStats = () => {
    if (!allParticipants.length) return null;

    const stats = {};
    allParticipants.forEach((p) => {
      const eventId = p.event?.id || "unknown";
      if (!stats[eventId]) {
        stats[eventId] = 0;
      }
      stats[eventId]++;
    });

    return stats;
  };

  const participantsStats = getParticipantsStats();

  if (loading && !formData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Memuat form penilaian...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {forms.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid size={18} />
              Form Penilaian {userData && `- Judge: ${userData.name}`}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {forms.map((form) => (
                <button
                  key={form.id}
                  onClick={() => setActiveFormId(form.id)}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    activeFormId === form.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activeFormId === form.id
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Folder size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{form.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {form.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} />
            Pilih Event
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Penilaian *
            </label>
            {loadingEvents ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                Memuat daftar event...
              </div>
            ) : events.length === 0 ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-red-50 text-red-700">
                Tidak ada event yang tersedia
              </div>
            ) : (
              <select
                value={eventId}
                onChange={handleEventChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              >
                <option value="">-- Pilih Event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                    {event.location && ` - ${event.location}`}
                    {event.id && ` (ID: ${event.id})`}
                  </option>
                ))}
              </select>
            )}
            {eventId && (
              <div className="mt-2 text-sm text-gray-600">
                Event yang dipilih:{" "}
                <span className="font-medium">
                  {events.find((e) => e.id.toString() === eventId)?.name}
                  {events.find((e) => e.id.toString() === eventId)?.id &&
                    ` (ID: ${events.find((e) => e.id.toString() === eventId)?.id})`}
                </span>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              Total {events.length} event tersedia
            </div>

            {/* Debug info */}
            {participantsStats && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  📊 Statistik Peserta (Debug):
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Total peserta di database: {allParticipants.length}</div>
                  {Object.entries(participantsStats).map(([eventId, count]) => (
                    <div key={eventId}>
                      Event ID {eventId}: {count} peserta
                      {eventId === "unknown" && " (tanpa event)"}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {formData && eventId && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={18} />
                Pilih Tim yang Dinilai
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Sekolah/Tim *
                </label>
                {loadingParticipants ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    Memuat daftar tim...
                  </div>
                ) : participantError ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-red-50 text-red-700">
                    <div className="font-medium">
                      ⚠️ Error: {participantError}
                    </div>
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-yellow-50 text-yellow-700">
                    <div className="font-medium">
                      ⚠️ Tidak ada tim yang terdaftar pada event ini
                    </div>
                    <div className="text-xs mt-1">
                      Event "
                      {events.find((e) => e.id.toString() === eventId)?.name}"
                      tidak memiliki tim yang terdaftar.
                      <br />
                      <span className="font-medium mt-1 block">
                        💡 Participant perlu mendaftar ke event ini terlebih
                        dahulu.
                      </span>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedTeamId}
                    onChange={handleTeamChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">-- Pilih Sekolah/Tim --</option>
                    {filteredParticipants.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.school_name || team.name}
                        {team.school_address && ` - ${team.school_address}`}
                        {team.coach && ` (Pelatih: ${team.coach})`}
                        {team.participant_category?.name &&
                          ` [${team.participant_category.name}]`}
                      </option>
                    ))}
                  </select>
                )}
                {teamName && (
                  <div className="mt-2 text-sm text-gray-600">
                    Tim yang dipilih:{" "}
                    <span className="font-medium">{teamName}</span>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  {filteredParticipants.length} tim terdaftar pada event ini
                </div>
                {eventId && allParticipants.length > 0 && (
                  <div className="mt-1 text-xs text-blue-600">
                    💡 Debug: Event ID {eventId} - {filteredParticipants.length}{" "}
                    tim ditemukan dari total {allParticipants.length} peserta
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <div className="text-sm text-gray-600">
                    Total Nilai Saat Ini
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {getTotalScore()}
                  </div>
                  <div className="text-sm text-gray-500">
                    dari {getTotalMaxScore()} poin
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-sm text-gray-600">Persentase</div>
                  <div
                    className={`text-3xl font-bold ${
                      getPercentage() >= 80
                        ? "text-green-600"
                        : getPercentage() >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {getPercentage()}%
                  </div>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button
                    type="button"
                    onClick={toggleAllCategories}
                    className="px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 text-sm font-medium"
                  >
                    {allExpanded ? "Tutup Semua" : "Buka Semua"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {renderScoringForm()}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={18} />
                Reset Semua Nilai
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!teamName || !selectedTeamId || !userData || !eventId}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-white rounded-md transition-colors ${
                  !teamName || !selectedTeamId || !userData || !eventId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Save size={18} />
                Simpan Penilaian
              </button>
            </div>

            {showSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      ✓ Nilai berhasil disimpan untuk {teamName} (
                      {formData.name}
                      ): {getTotalScore()} poin ({getPercentage()}%)
                      <br />
                      <span className="text-xs">
                        Event:{" "}
                        {events.find((e) => e.id.toString() === eventId)?.name},
                        Dinilai oleh: {userData?.name}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScoreForm;
