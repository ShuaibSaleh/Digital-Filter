import pandas as pd
import numpy as np
from scipy import signal
import scipy



class Filters:

    def getComplex(numbers=[[]]):

        complexNumbers = [0]*len(numbers)

        for i in np.arange(0,len(numbers)):
            real = numbers[i][0]
            im = numbers[i][1]

            complexNumbers[i] = complex(real+im*1j)

        return complexNumbers
    
    def applyingFilter(zeros=[],poles=[],inputSignal=[]):

        outputSignal = []

        numeratorCoeff , denominatorCoeff = scipy.signal.zpk2tf(zeros,poles, 1)

        if(len(inputSignal)>max(len(numeratorCoeff),len(denominatorCoeff))):
            outputSignal=[0]*(len(inputSignal)-max(len(numeratorCoeff),len(denominatorCoeff)))

            for j in  np.arange(0,len(inputSignal)-max(len(numeratorCoeff),len(denominatorCoeff))):
                outputSignal[j] = numeratorCoeff[0]*inputSignal[j]
                # past readings
                for m in np.arange(1,len(numeratorCoeff)):
                    outputSignal[j] += numeratorCoeff[m]*inputSignal[j-m] 
                # past outputs
                
                for k in np.arange(1,len(denominatorCoeff)):
                    outputSignal[j] += - denominatorCoeff[k]*outputSignal[j-k]

                outputSignal[j]=np.abs(outputSignal[j])

            return outputSignal


    def extractData(path,firstColIndex):
            data=[]
            df=pd.read_csv(path)
            for i in range(len(df.iloc[:, firstColIndex])):
                Rel=df.iloc[i,firstColIndex]
                Im=df.iloc[i,firstColIndex+1]
                temp=[Rel ,Im]
                if Rel == Im == 0:
                    #  data=[]
                     continue
                else:
                  data.append(temp)
                  temp=[]

            return data


