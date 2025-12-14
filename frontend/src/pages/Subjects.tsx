import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Clock } from 'lucide-react';

const Subjects = () => {
  const subjects = [
    { code: '22ME15501', name: 'COMPUTER VISION', mnemonic: 'CV', teacher: 'Mr.K.Rahumaan, AP/AI&DS', periods: 5 },
    { code: '22AI14601', name: 'DATA SECURITY', mnemonic: 'DS', teacher: 'Mrs.M.Chitra,AP/AI&DS', periods: 5 },
    { code: '22AI14602', name: 'REINFORCEMENT LEARNING', mnemonic: 'RL', teacher: 'Mrs.R.Nithiya,AP/AI&DS', periods: 5 },
    { code: '22AI14603', name: 'TEXT AND SPEECH ANALYTICS', mnemonic: 'TSA', teacher: 'Mrs.R.Mekala,AP/AI&DS', periods: 5 },
    { code: '22AI15026', name: 'SOCIAL MEDIA ANALYSIS', mnemonic: 'SMA', teacher: 'Mrs.V.Aravindh Raj.,AP/AI&DS', periods: 5 },
    { code: '22IT10010', name: 'ROBOTICS AND AUTOMATION', mnemonic: 'RA', teacher: 'Dr.R.Suresh,AP/ECE', periods: 5 },
    { code: '22AI24601', name: 'COMPUTER VISION LABORATORY', mnemonic: 'CV LAB', teacher: 'Mr.K.Rahumaan, AP/AI&DS', periods: 3 },
    { code: '22AI15030', name: 'PATTERN RECOGNITION', mnemonic: 'PR', teacher: 'Mr.R.Sathishkumar,AP/AI&DS', periods: 2 },
    { code: '22AI15033', name: 'SOFT COMPUTING', mnemonic: 'SC', teacher: 'Dr.S.Ananth,HoD /AI&DS', periods: 2 }
  ];

  const totalPeriods = subjects.reduce((sum, subject) => sum + subject.periods, 0);

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-heading font-bold gradient-text">Subjects</h1>
        <p className="text-muted-foreground mt-2">AI&DS Department Subject Details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{subjects.length}</div>
            <div className="text-sm text-muted-foreground">Total Subjects</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold">{totalPeriods}</div>
            <div className="text-sm text-muted-foreground">Total Periods/Week</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-muted-foreground">Faculty Members</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subjects.map((subject, index) => (
          <Card key={subject.code} className="glass-card hover-lift">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{subject.code}</p>
                </div>
                <Badge variant="secondary">{subject.mnemonic}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{subject.teacher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{subject.periods} periods per week</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subjects;