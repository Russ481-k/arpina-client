import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import { CartItem, EstimateService } from "@/types/estimate";
import { Seminars, rooms } from "@/data/estimateData";
import { DateInfo } from "@/types/calendar";

interface EstimateContextType {
  // Cart State
  cart: CartItem[];
  addToCart: (
    item: Omit<CartItem, "id" | "checkInDate" | "checkOutDate">
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, newQuantity: number) => void;
  totalAmount: number;

  // Stepper State
  step: number;
  setStep: (step: number) => void;

  // Step 1: Service Selection
  selectedServices: EstimateService[];
  toggleService: (service: EstimateService) => void;

  // Step 2: Date Selection
  checkInDate: DateInfo | null;
  setCheckInDate: Dispatch<SetStateAction<DateInfo | null>>;
  checkOutDate: DateInfo | null;
  setCheckOutDate: Dispatch<SetStateAction<DateInfo | null>>;
  handleApplyDates: () => void;
  isDateSelectionValid: boolean;
}

const EstimateContext = createContext<EstimateContextType | undefined>(
  undefined
);

export const EstimateProvider = ({ children }: { children: ReactNode }) => {
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Stepper State
  const [step, setStep] = useState(1);

  // Service Selection State
  const [selectedServices, setSelectedServices] = useState<EstimateService[]>(
    []
  );

  // Date Selection State
  const [checkInDate, setCheckInDate] = useState<DateInfo | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<DateInfo | null>(null);

  // --- LOGIC ---

  // Stepper Logic

  // Service Toggle Logic
  const toggleService = (service: EstimateService) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  // Date Logic
  const handleApplyDates = () => {
    if (checkInDate && checkOutDate) {
      setStep((s) => s + 1);
    }
  };
  const isDateSelectionValid = !!(checkInDate && checkOutDate);

  // Cart Logic
  const addToCart = (
    item: Omit<CartItem, "id" | "checkInDate" | "checkOutDate">
  ) => {
    if (!checkInDate || !checkOutDate) {
      console.error("날짜를 먼저 선택해야 합니다.");
      return;
    }

    const newItem: CartItem = {
      ...item,
      id: `${item.productId}-${Date.now()}`,
      checkInDate: new Date(
        checkInDate.year,
        checkInDate.month,
        checkInDate.day
      ),
      checkOutDate: new Date(
        checkOutDate.year,
        checkOutDate.month,
        checkOutDate.day
      ),
    };

    setCart((prevCart) => [...prevCart, newItem]);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  // Price Calculation Logic (from useEstimate)
  const getWeekdayWeekendNights = (checkIn: Date, checkOut: Date) => {
    let weekday = 0;
    let weekend = 0;
    for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) weekend++;
      else weekday++;
    }
    return { weekday, weekend };
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => {
      let itemTotal = 0;
      if (item.type === "seminar") {
        const seminar = Seminars.find((s) => s.name === item.name);
        if (seminar) {
          const nights =
            (item.checkOutDate.getTime() - item.checkInDate.getTime()) /
            (1000 * 60 * 60 * 24);
          itemTotal = seminar.price * (nights + 1); // 세미나는 일 단위
        }
      } else if (item.type === "room") {
        const room = rooms.find((r) => r.name === item.name);
        if (room) {
          const { weekday, weekend } = getWeekdayWeekendNights(
            item.checkInDate,
            item.checkOutDate
          );
          itemTotal =
            (room.weekdayPrice * weekday + room.weekendPrice * weekend) *
            item.quantity;
        }
      }
      return total + itemTotal;
    }, 0);
  }, [cart]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    totalAmount,
    step,
    setStep,
    selectedServices,
    toggleService,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    handleApplyDates,
    isDateSelectionValid,
  };

  return (
    <EstimateContext.Provider value={value}>
      {children}
    </EstimateContext.Provider>
  );
};

export const useEstimateContext = () => {
  const context = useContext(EstimateContext);
  if (context === undefined) {
    throw new Error(
      "useEstimateContext must be used within an EstimateProvider"
    );
  }
  return context;
};
