import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Phone, Clock, RotateCcw, CheckCircle } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface Lesson {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TrainingDay {
  day: number;
  title: string;
  lessons: Lesson[];
}

export default function TrainingActivity() {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<string>('');

  const trainingDays: TrainingDay[] = [
    {
      day: 1,
      title: "Foundation & Introduction",
      lessons: [
        {
          id: "day1-intro",
          title: "Intro to LedmyPlace and Products",
          description: "Learn about our company mission, product portfolio, and value propositions",
          icon: <Calendar className="h-4 w-4" />
        },
        {
          id: "day1-leadership",
          title: "Meet and Greet with Leadership",
          description: "Introduction to key team members and company culture",
          icon: <Users className="h-4 w-4" />
        }
      ]
    },
    {
      day: 2,
      title: "Products & Sales Tools",
      lessons: [
        {
          id: "day2-products",
          title: "Products Cont.",
          description: "Deep dive into product features, benefits, and competitive advantages",
          icon: <Calendar className="h-4 w-4" />
        },
        {
          id: "day2-systems",
          title: "Systems & Tools",
          description: "Master our CRM, sales tools, and internal systems",
          icon: <Calendar className="h-4 w-4" />
        },
        {
          id: "day2-scripts",
          title: "Call Scripts, Profiles & Positioning",
          description: "Learn proven call scripts and customer positioning strategies",
          icon: <Phone className="h-4 w-4" />
        },
        {
          id: "day2-emails",
          title: "Email Sequences",
          description: "Master our email follow-up sequences and templates",
          icon: <Calendar className="h-4 w-4" />
        }
      ]
    },
    {
      day: 3,
      title: "Practice & Evaluation",
      lessons: [
        {
          id: "day3-roleplay",
          title: "Role Play activity with System Navigation",
          description: "Practice sales scenarios while navigating our systems",
          icon: <Phone className="h-4 w-4" />
        },
        {
          id: "day3-calls",
          title: "Mock Calls",
          description: "Simulate real customer interactions with feedback",
          icon: <Phone className="h-4 w-4" />
        },
        {
          id: "day3-coaching",
          title: "Coaching Session & Evaluation",
          description: "One-on-one coaching and performance evaluation",
          icon: <Users className="h-4 w-4" />
        }
      ]
    }
  ];

  const totalLessons = trainingDays.reduce((acc, day) => acc + day.lessons.length, 0);
  const completionPercentage = (completedLessons.size / totalLessons) * 100;

  // Load completion data from localStorage
  useEffect(() => {
    const savedCompletions = localStorage.getItem('trainingCompletions');
    if (savedCompletions) {
      setCompletedLessons(new Set(JSON.parse(savedCompletions)));
    }
  }, []);

  // Save completion data to localStorage
  useEffect(() => {
    localStorage.setItem('trainingCompletions', JSON.stringify(Array.from(completedLessons)));
  }, [completedLessons]);

  const handleLessonSelection = (lessonId: string) => {
    setSelectedLesson(lessonId);
    const newCompletedLessons = new Set(completedLessons);
    if (completedLessons.has(lessonId)) {
      newCompletedLessons.delete(lessonId);
    } else {
      newCompletedLessons.add(lessonId);
    }
    setCompletedLessons(newCompletedLessons);
  };

  const resetProgress = () => {
    setCompletedLessons(new Set());
    setSelectedLesson('');
    localStorage.removeItem('trainingCompletions');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/a861675f-582f-4b42-80ff-16343ef6836f.png" 
                alt="Company Logo" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">3-Day Training Activity</h1>
                <p className="text-muted-foreground">Track your training progress and completion</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/'}
                  className="text-sm"
                >
                  Sales Training
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/training-activity'}
                  className="text-sm"
                >
                  Training Activity
                </Button>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Progress Overview */}
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Training Progress
              </CardTitle>
              <div className="flex items-center gap-4">
                <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                  {completedLessons.size} / {totalLessons} Completed
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetProgress}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Progress
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Training Days */}
        <div className="space-y-6">
          {trainingDays.map((day) => {
            const dayCompletedLessons = day.lessons.filter(lesson => completedLessons.has(lesson.id)).length;
            const dayProgress = (dayCompletedLessons / day.lessons.length) * 100;

            return (
              <Card key={day.day} className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {day.day}
                        </div>
                        Day {day.day}: {day.title}
                      </CardTitle>
                    </div>
                    <Badge variant={dayProgress === 100 ? "default" : "secondary"}>
                      {dayCompletedLessons} / {day.lessons.length}
                    </Badge>
                  </div>
                  <Progress value={dayProgress} className="h-1 mt-2" />
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedLesson}
                    onValueChange={handleLessonSelection}
                    className="space-y-3"
                  >
                    {day.lessons.map((lesson) => {
                      const isCompleted = completedLessons.has(lesson.id);
                      
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                            isCompleted
                              ? 'bg-success/10 border-success/30 shadow-sm'
                              : 'hover:bg-muted/50 hover:border-border'
                          }`}
                          onClick={() => handleLessonSelection(lesson.id)}
                        >
                          <RadioGroupItem
                            value={lesson.id}
                            id={lesson.id}
                            className={isCompleted ? 'border-success text-success' : ''}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              {lesson.icon}
                              <h4 className={`font-medium ${isCompleted ? 'text-success' : ''}`}>
                                {lesson.title}
                              </h4>
                              {isCompleted && (
                                <CheckCircle className="h-4 w-4 text-success" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {lesson.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Completion Message */}
        {completionPercentage === 100 && (
          <Card className="mt-6 border-success/30 bg-success/5 shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 text-success">
                <CheckCircle className="h-6 w-6" />
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Congratulations!</h3>
                  <p className="text-sm">You have completed all training activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}