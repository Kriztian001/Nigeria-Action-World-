class AISystem {
  constructor(scene) {
    this.scene = scene;
  }

  onEntityAttacked(npc, attackerMesh) {
    if (!npc || npc.currentHp <= 0) return;

    // Confront entity & display overhead health bar
    this.scene.combatSystem.confrontEntity(npc, 25);

    if (npc.isGangMember) {
      // Gang Retaliation Mechanics
      npc.isAggressive = true;
      npc.target = attackerMesh;
      this.alertNearbyGang(npc, attackerMesh);
    } else {
      // Civilian Behavior: 80% Flee / 20% Counter-attack
      if (Math.random() < 0.8) {
        npc.isFleeing = true;
        npc.threatPos = attackerMesh.position.clone();
      } else {
        npc.isAggressive = true;
        npc.target = attackerMesh;
      }
    }
  }

  alertNearbyGang(sourceNpc, attackerMesh) {
    const radius = 15;
    this.scene.npcs.forEach(npc => {
      if (npc.isGangMember && npc.mesh) {
        const dist = npc.mesh.position.distanceTo(sourceNpc.mesh.position);
        if (dist <= radius && !npc.isAggressive) {
          this.scene.combatSystem.confrontEntity(npc, 0);
          npc.isAggressive = true;
          npc.target = attackerMesh;
        }
      }
    });
  }

  update(delta) {
    this.scene.npcs?.forEach(npc => {
      if (!npc.mesh || npc.currentHp <= 0) return;

      if (npc.isFleeing && npc.threatPos) {
        // Move away from threat in 3D
        const dir = npc.mesh.position.clone().sub(npc.threatPos).normalize();
        npc.mesh.position.addScaledVector(dir, delta * 5);
        npc.mesh.lookAt(npc.mesh.position.clone().add(dir));
      } else if (npc.isAggressive && npc.target) {
        // Move toward player to attack
        const dir = npc.target.position.clone().sub(npc.mesh.position).normalize();
        npc.mesh.position.addScaledVector(dir, delta * 3.8);
        npc.mesh.lookAt(npc.target.position);
      }
    }
  );
  }
}
