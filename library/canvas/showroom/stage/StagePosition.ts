const stagePositions = [
  [0.5, 0.575], // 1
  [0.455, 0.59], // 2
  [0.545, 0.59] // 3
]

// calculate stage position for rank 4 - 13
function calculatePodium () {
  const padding = 0.09
  const yPos = 0.602
  const space = 0.0405
  const spaceY = 0.014
  for (let i = 0; i < 5; i++) {
    stagePositions.push([0.5 - padding - space * i, yPos - spaceY * i])
    stagePositions.push([0.5 + padding + space * i, yPos - spaceY * i])
  }
}

// calculate stage position for rank 14 - 100
function calculateStage () {
  const maxPerson = 100
  const perLine = 16
  const maxLine = Math.floor(maxPerson / perLine)
  const from = 0.19
  const to = 0.81
  const space = (to - from) / perLine
  const spaceY = 0.065
  const firstLine = 0.678

  for (let y = 0; y < maxLine; y++) {
    for (let x = 0; x < perLine; x++) {
      const posX = from + space / 2 + space * x
      const posY = firstLine + spaceY * y
      stagePositions.push([posX, posY])
    }
  }
}

calculatePodium()
calculateStage()

export default stagePositions
