class AISystem {
    constructor(scene) {
        this.scene = scene;
    }

    // Trigger AI behavior when confronted or attacked
    onEntityAttacked(target, attacker) {
        if (!target.active || target.currentHp <= 0) return;

        // Apply hit damage
        this.scene.combatSystem.applyDamage(target, 20);

        if (target.isGangMember) {
            // Gang behavior: Retaliate & fight back
            this.retaliate(target, attacker);
            this.alertNearbyGangMembers(target, attacker);
        } else {
            // Civilian behavior: 80% Flee / 20% Fight back
            if (Math.random() < 0.8) {
                this.fleeFrom(target, attacker);
            } else {
                this.retaliate(target, attacker);
            }
        }
    }

    // Make target run directly away from attacker
    fleeFrom(entity, threat) {
        entity.isFleeing = true;
        const angle = Phaser.Math.Angle.Between(threat.x, threat.y, entity.x, entity.y);
        const fleeSpeed = 140;

        entity.body.setVelocity(
            Math.cos(angle) * fleeSpeed,
            Math.sin(angle) * fleeSpeed
        );
    }

    // Lock onto player and attack back
    retaliate(entity, target) {
        entity.isAggressive = true;
        entity.targetEnemy = target;

        this.scene.physics.moveToObject(entity, target, 110);
    }

    // Alert other gang members in proximity
    alertNearbyGangMembers(sourceEntity, attacker) {
        const alertRadius = 200;

        this.scene.npcs.getChildren().forEach(npc => {
            if (npc.isGangMember && npc.gangFaction === sourceEntity.gangFaction) {
                const dist = Phaser.Math.Distance.Between(sourceEntity.x, sourceEntity.y, npc.x, npc.y);
                if (dist <= alertRadius && !npc.isAggressive) {
                    this.retaliate(npc, attacker);
                }
            }
        });
    }
}
