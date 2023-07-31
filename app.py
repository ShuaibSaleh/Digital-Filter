from flask import Flask, render_template, send_file, request, redirect,jsonify,json
import numpy as np

from werkzeug.utils import secure_filename
import pandas as pd
import random
from pathlib import Path
import os
from functions import Filters as fs

app = Flask(__name__)

def create_app():
    _app = Flask(__name__)
    return _app



@app.route("/", methods=["GET", "POST"])
def index():

    return render_template('index.html')

@app.route("/processing", methods=["GET", "POST"])
def processing():
    if request.method == "POST":

        data   = json.loads(request.data)

        zeros = fs.getComplex(data['zeros'])
        
        
        poles = fs.getComplex(data['poles'])
        inputSignal = data['inputSignal']
        outputSignal = fs.applyingFilter(zeros,poles,inputSignal)
        response_data = json.dumps({
        'output_signal':outputSignal
        })

        response_data = response_data

    return jsonify(response_data)



#  export function  

@app.route("/ExportZeroesPole", methods=["GET", "POST"])
def export():
    zeroReal=[]
    zeroImag=[]
    polesReal=[]
    polesImg=[]

    if request.method == "POST":

            data   = json.loads(request.data)
            zeros=data['zeros']
            poles=data['poles']



            for i in range(len(zeros)):
                zeroReal.append(zeros[i][0])
                zeroImag.append(zeros[i][1])
                
            for i in range(len(poles)):
                polesReal.append(poles[i][0])
                polesImg.append(poles[i][1])


            if len(zeros)<len(poles):
                insertZero=len(poles)-len(zeros)
                for i in range(insertZero):
                    zeroReal.append(0)
                    zeroImag.append(0)

            elif len(zeros)>len(poles):
                insertZero=len(zeros)-len(poles)
                for i in range(insertZero):
                    polesReal.append(0)
                    polesImg.append(0)


            datatosavezeropole={
                "zeroReal":zeroReal ,
                "zeroImag":zeroImag,
                "polesReal":polesReal,
                "polesImg":polesImg
            }

            df=pd.DataFrame(datatosavezeropole)
            
            flag=True
            while(flag):
                path="export{}.csv".format(random.randint(0 ,10))
                if os.path.exists(path):
                    continue
                else:
                    df.to_csv(path)
                    flag=False


    return render_template('index.html')




# import function 
@app.route("/importZeroesPole", methods=["GET", "POST"])
def importFun():
    if request.method == "POST":

        data   = json.loads(request.data)
        path = data['path']
        my_new_path = str(path.replace("C:\\fakepath\\",""))
      
        zeros  = fs.extractData(my_new_path,1)
        poles = fs.extractData(my_new_path,3)
        response_data = json.dumps({
        'zeros':zeros,
        'poles':poles
        })
        
        response_data = response_data
        

    return jsonify(response_data)
    
if __name__ == "__main__":
    
    app.run(debug=True, threaded=True, port=39548)