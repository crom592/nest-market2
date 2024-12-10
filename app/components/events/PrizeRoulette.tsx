'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Prize {
  id: string;
  name: string;
  probability: number;
  points: number;
  color: string;
}

const PRIZES: Prize[] = [
  { id: '1', name: '1000P', probability: 0.01, points: 1000, color: '#FF6B6B' },
  { id: '2', name: '500P', probability: 0.05, points: 500, color: '#4ECDC4' },
  { id: '3', name: '300P', probability: 0.1, points: 300, color: '#45B7D1' },
  { id: '4', name: '100P', probability: 0.2, points: 100, color: '#96CEB4' },
  { id: '5', name: '50P', probability: 0.3, points: 50, color: '#FFEEAD' },
  { id: '6', name: '다음 기회에...', probability: 0.34, points: 0, color: '#D4D4D4' },
];

const SPIN_DURATION = 5000; // 5초
const REQUIRED_POINTS = 1000; // 룰렛 참여에 필요한 포인트

export default function PrizeRoulette() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchUserPoints();
    drawRoulette();
  }, []);

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/points/total');
      if (!response.ok) throw new Error('포인트 조회에 실패했습니다.');
      const data = await response.json();
      setUserPoints(data.points);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    }
  };

  const drawRoulette = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = 0;
    PRIZES.forEach((prize) => {
      const sliceAngle = 2 * Math.PI * prize.probability;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.fillText(prize.name, radius - 20, 0);
      ctx.restore();

      startAngle += sliceAngle;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();
  };

  const spinRoulette = async () => {
    if (isSpinning || userPoints < REQUIRED_POINTS) return;

    try {
      const response = await fetch('/api/events/roulette/spin', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('룰렛 참여에 실패했습니다.');

      const { prizeId } = await response.json();
      const prize = PRIZES.find(p => p.id === prizeId);
      if (!prize) throw new Error('잘못된 상품입니다.');

      setIsSpinning(true);
      setSelectedPrize(prize);

      // Calculate final rotation
      let finalRotation = 360 * 5; // Base spins
      const prizeRotation = calculatePrizeRotation(prize);
      finalRotation += prizeRotation;

      // Animate rotation
      setRotation(finalRotation);

      // Show result after animation
      setTimeout(() => {
        setIsSpinning(false);
        setShowResult(true);
        if (prize.points > 0) {
          setUserPoints(prev => prev + prize.points);
        }
      }, SPIN_DURATION);

    } catch (error) {
      console.error('Failed to spin roulette:', error);
      toast.error('룰렛 참여에 실패했습니다.');
      setIsSpinning(false);
    }
  };

  const calculatePrizeRotation = (prize: Prize) => {
    let rotation = 0;
    let currentProb = 0;
    
    for (const p of PRIZES) {
      if (p.id === prize.id) {
        rotation = 360 * (currentProb + prize.probability / 2);
        break;
      }
      currentProb += p.probability;
    }
    
    return rotation;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          행운의 룰렛
        </CardTitle>
        <CardDescription>
          {REQUIRED_POINTS}P로 룰렛을 돌려 추가 포인트를 획득하세요!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: rotation }}
              transition={{
                duration: SPIN_DURATION / 1000,
                ease: 'easeOut',
              }}
              className="relative"
            >
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="rounded-full"
              />
            </motion.div>
            <div className="absolute top-0 left-1/2 -ml-3 w-0 h-0 border-l-[12px] border-l-transparent border-t-[20px] border-t-red-500 border-r-[12px] border-r-transparent" />
          </div>

          <Button
            onClick={spinRoulette}
            disabled={isSpinning || userPoints < REQUIRED_POINTS}
            className="w-full max-w-xs"
          >
            {isSpinning ? '룰렛 돌아가는 중...' : '룰렛 돌리기'}
          </Button>

          <p className="text-sm text-gray-500">
            보유 포인트: {userPoints.toLocaleString()}P
          </p>
        </div>

        <Dialog open={showResult} onOpenChange={setShowResult}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPrize?.points > 0 ? '축하합니다! 🎉' : '아쉽네요... 😢'}
              </DialogTitle>
              <DialogDescription>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6"
                >
                  <p className="text-2xl font-bold mb-2">
                    {selectedPrize?.name}
                  </p>
                  {selectedPrize?.points > 0 ? (
                    <p className="text-gray-600">
                      {selectedPrize.points}P가 지급되었습니다!
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      다음 기회를 노려보세요!
                    </p>
                  )}
                </motion.div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
