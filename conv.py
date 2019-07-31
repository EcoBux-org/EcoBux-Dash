import json

convertAmount = 100
#convertAmount = 0.000001

jsonFile = open('mamoni.js', "r") # Open the JSON file for reading
data = json.load(jsonFile)
jsonFile.close()
i = j = k = 0
for feature in data["features"]:
    for coords in feature["geometry"]["coordinates"][0]:
        #print(coords)
        #print(coord)

        #print(i,j,k)

        print(data["features"][i]["geometry"]["coordinates"][0][j])

        data["features"][i]["geometry"]["coordinates"][0][j][0],data["features"][i]["geometry"]["coordinates"][0][j][1] = data["features"][i]["geometry"]["coordinates"][0][j][1], data["features"][i]["geometry"]["coordinates"][0][j][0] 
        print(data["features"][i]["geometry"]["coordinates"][0][j])

        #print(data["features"][i]["geometry"]["coordinates"][0][j][k])
        #print(i,j,k)
        j+=1
    j=0
    i+=1

jsonFile = open("mamoni.2.js", "w+")
jsonFile.write(json.dumps(data))
jsonFile.close()
